import mongoose from 'mongoose';
import { Booking } from '../../models/Booking.model.js';
import { WalletTransaction } from '../../models/WalletTransaction.model.js';
import { User } from '../../models/User.model.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import redisClient from '../../config/redis.js';
import { getRealTimeAvailability } from '../../services/inventory.service.js';
import ROLES from '../../constants/roles.js';
import { sendEmail, processReferralReward } from '../../services/commonAuth.service.js';
import { getBookingConfirmationEmailTemplate } from '../../utils/emailTemplates.js';
import { sendNotification } from '../../utils/notification.util.js';
import { format12hr } from '../../utils/timeUtils.js';
import { PAYMENT_WINDOW_SECONDS, DEFAULT_SLOT_DURATION } from '../../constants/constants.js';

// Service Imports
import * as bookingService from '../../services/user/userBooking.service.js';

export const BookingRestaurant = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { restaurantId, bookingDate, slotTime, guests, preOrderItems, useWallet, appliedCouponId, appliedOfferId } = req.body;
        const userId = req.user._id;

        // 1. Basic Validations (existence, schedule, capacity)
        const { restaurant, activeSchedule } = await bookingService.validateBookingBasics(
            restaurantId, bookingDate, slotTime, guests, userId
        );

        // 2. Pricing & Verification (dishes, coupons, offers)
        const pricing = await bookingService.calculateBookingFinals(
            restaurant, preOrderItems, guests, activeSchedule.slotPrice, appliedCouponId, appliedOfferId
        );

        const duration = activeSchedule.slotConfig?.duration || DEFAULT_SLOT_DURATION;
        const slotEndTime = parseInt(slotTime) + duration;
        const holdKey = `hold:${userId}:${restaurantId}:${bookingDate}:${slotTime}:seats:${guests}`;

        // 3. Wallet Logic
        let walletAmountUsed = 0;
        if (useWallet) {
            const user = await User.findById(userId).session(session);
            if (user && user.walletBalance > 0) {
                walletAmountUsed = Math.min(user.walletBalance, pricing.finalTotal);
                if (walletAmountUsed === pricing.finalTotal) {
                    user.walletBalance -= walletAmountUsed;
                    await user.save({ session });
                }
            }
        }

        const bookingData = {
            userId, restaurantId, restaurantName: restaurant.restaurantName,
            bookingDate, slotTime, slotEndTime, guests,
            totalAmount: pricing.finalTotal, slotPrice: activeSchedule.slotPrice || 0,
            tax: pricing.tax, platformFee: pricing.platformFee,
            preOrderItems: pricing.verifiedPreOrderItems,
            appliedCoupon: pricing.couponDetails, appliedOffer: pricing.offerDetails,
            walletAmountUsed
        };

        // --- CASE 1: FULL WALLET PAYMENT ---
        if (walletAmountUsed === pricing.finalTotal) {
            const booking = new Booking({ ...bookingData, status: 'approved' });
            const [walletTx] = await WalletTransaction.create([{
                userId, bookingId: booking._id, amount: -walletAmountUsed,
                description: `Used wallet for booking at ${restaurant.restaurantName}`
            }], { session });

            booking.walletTransactionId = walletTx._id;
            await booking.save({ session });
            
            // Process Referral Award if this is their first purchase
            await processReferralReward(userId, session);

            await session.commitTransaction();

            // Background Tasks
            await redisClient.del(holdKey);
            emitSlotUpdate(req, restaurantId, bookingDate, slotTime);
            sendBookingNotifications(req, booking, restaurant);

            return res.status(201).json({
                success: true, message: "Booking successful using wallet.",
                booking, remainingAmount: 0
            });
        }

        // --- CASE 2: ONLINE PAYMENT ---
        const amountToPay = pricing.finalTotal - walletAmountUsed;
        const order = await bookingService.createRazorpayOrder(amountToPay);

        const pendingBooking = new Booking({
            ...bookingData, status: 'pending-payment', razorpayOrderId: order.id
        });

        await pendingBooking.save({ session });
        await session.commitTransaction();
        await redisClient.expire(holdKey, PAYMENT_WINDOW_SECONDS);

        res.status(201).json({
            success: true, message: "Booking initiated successfully.",
            order, remainingAmount: amountToPay, bookingId: pendingBooking._id
        });

    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        res.status(error.status || 500).json({ success: false, message: error.message || "Something went wrong" });
    } finally {
        session.endSession();
    }
};

export const checkBookingAvailability = async (req, res) => {
    try {
        const userId = req.user._id;
        const booking = await Booking.findById(req.params.id);
        if (!booking || booking.status !== 'pending-payment') {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: "Booking session not found or expired." });
        }

        // Use core pricing logic to re-verify existence (dishes, coupons, offers)
        // This is a great reuse of our Service layer!
        const restaurant = await Restaurant.findById(booking.restaurantId).select('menuItems').lean();
        await bookingService.calculateBookingFinals(
            restaurant, booking.preOrderItems, booking.guests, booking.slotPrice, 
            booking.appliedCoupon?.couponId, booking.appliedOffer?.offerId
        );

        // Re-check seat capacity
        const available = await getRealTimeAvailability(booking.restaurantId, booking.bookingDate, booking.slotTime, userId);
        if (available < booking.guests) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "This slot is no longer available." });
        }

        res.status(STATUS_CODES.OK).json({ success: true, message: "Available" });
    } catch (error) {
        res.status(error.status || 500).json({ success: false, message: error.message });
    }
};

export const retryBookingPayment = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const booking = await Booking.findOne({ _id: req.params.bookingId, userId });
        if (!booking || booking.status === 'approved' || booking.status === 'checked-in') {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Invalid retry request." });
        }

        // 1. Re-verify everything using the Service
        const { restaurant } = await bookingService.validateBookingBasics(
            booking.restaurantId, booking.bookingDate, booking.slotTime, booking.guests, userId
        );
        await bookingService.calculateBookingFinals(
            restaurant, booking.preOrderItems, booking.guests, booking.slotPrice,
            booking.appliedCoupon?.couponId, booking.appliedOffer?.offerId
        );

        // 2. Re-establish Redis Hold
        const dStr = new Date(booking.bookingDate);
        const formattedDate = `${dStr.getUTCFullYear()}-${String(dStr.getUTCMonth() + 1).padStart(2, '0')}-${String(dStr.getUTCDate()).padStart(2, '0')}`;
        const holdKey = `hold:${userId}:${booking.restaurantId}:${formattedDate}:${booking.slotTime}:seats:${booking.guests}`;
        await redisClient.setEx(holdKey, PAYMENT_WINDOW_SECONDS, booking.guests.toString());

        // 3. New Razorpay Order
        const order = await bookingService.createRazorpayOrder(booking.totalAmount);
        booking.razorpayOrderId = order.id;
        await booking.save();

        res.status(STATUS_CODES.OK).json({ success: true, order, message: "Retry initiated." });
    } catch (error) {
        res.status(error.status || 500).json({ success: false, message: error.message });
    }
};

export const cancelBooking = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { id } = req.params;
        const userId = req.user._id;

        const booking = await Booking.findOne({ _id: id, userId }).populate('restaurantId', 'restaurantName').session(session);
        if (!booking || booking.status === 'canceled' || booking.status === 'checked-in') {
            throw new Error("Booking not found, already canceled, or you have already checked in.");
        }

        // Validity check (prevent past cancellations)
        const now = new Date();
        const today = new Date(now).setUTCHours(0,0,0,0);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (booking.bookingDate < today || (booking.bookingDate.getTime() === today && booking.slotTime < currentMinutes)) {
            throw new Error("Cannot cancel a past booking.");
        }

        const previousStatus = booking.status;
        booking.status = 'canceled';
        booking.canceledBy = ROLES.USER;
        await booking.save({ session });

        if (previousStatus !== 'pending-payment') {
            await User.findByIdAndUpdate(userId, { $inc: { walletBalance: booking.totalAmount } }, { session });
            await WalletTransaction.create([{
                userId, bookingId: booking._id, amount: booking.totalAmount,
                description: `Refund for cancelled booking at ${booking.restaurantId.restaurantName}`
            }], { session });
        }

        await session.commitTransaction();
        
        // Notifications
        await sendNotification(req, {
            recipientId: userId, title: "Booking Cancelled",
            message: `Reservation at ${booking.restaurantId.restaurantName} cancelled. ₹${booking.totalAmount} refunded to wallet.`,
            type: "BOOKING",
            link: `/my-bookings/${booking._id}`
        });

        res.status(STATUS_CODES.OK).json({ success: true, message: "Booking canceled successfully.", booking });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// --- Helper Functions (Local) ---
const emitSlotUpdate = async (req, restaurantId, bookingDate, slotTime) => {
    const io = req.app.get("io");
    const newAvailable = await getRealTimeAvailability(restaurantId, bookingDate, slotTime);
    io.to(`res_${restaurantId}_${bookingDate}`).emit("slot_update", { slotMinutes: slotTime, available: newAvailable });
};

const sendBookingNotifications = async (req, booking, restaurant) => {
    try {
        await sendNotification(req, {
            recipientId: booking.userId, title: "Booking Confirmed! 🎉",
            message: `Reservation at ${restaurant.restaurantName} is confirmed.`,
            type: "BOOKING",
            link: `/my-bookings/${booking._id}`
        });
        const html = getBookingConfirmationEmailTemplate(booking, { restaurantName: restaurant.restaurantName }, req.user.fullName);
        await sendEmail(req.user.email, `Booking Confirmed: ${restaurant.restaurantName}`, "", html);
    } catch (err) {
        console.error("Notification/Email Error:", err);
    }
};
