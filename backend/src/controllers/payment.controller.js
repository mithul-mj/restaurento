import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import crypto from 'crypto'
import { env } from '../config/env.config.js';
import { Booking } from '../models/Booking.model.js';
import { WalletTransaction } from '../models/WalletTransaction.model.js';
import { User } from '../models/User.model.js';
import STATUS_CODES from '../constants/statusCodes.js';
import { sendEmail } from '../services/commonAuth.service.js';
import { getBookingConfirmationEmailTemplate } from '../utils/emailTemplates.js';
import { sendNotification } from '../utils/notification.util.js';
import { format12hr } from '../utils/timeUtils.js';
import { getRealTimeAvailability } from '../services/inventory.service.js';

import redisClient from '../config/redis.js';




const razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

export const verifyRazorpayPayment = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Find the pending booking in DB
            const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id })
                .populate('restaurantId', 'restaurantName')
                .session(session);

            if (!booking) {
                await session.abortTransaction();
                return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Booking not found or session expired." });
            }

            if (booking.status !== 'pending-payment') {
                await session.abortTransaction();
                return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Booking is already processed." });
            }

            // 1. Safety Check: Is the wallet balance still sufficient?
            // (User might have spent their wallet on another booking while this one was pending)
            if (booking.walletAmountUsed > 0) {
                const user = await User.findById(booking.userId).session(session);
                if (!user || user.walletBalance < booking.walletAmountUsed) {
                    // FAIL CASE: Wallet balance is no longer sufficient.
                    // Refund the online payment amount back to the user's wallet.
                    const onlinePaymentAmount = booking.totalAmount - booking.walletAmountUsed;
                    await User.findByIdAndUpdate(booking.userId, { 
                        $inc: { walletBalance: onlinePaymentAmount } 
                    }, { session });

                    await WalletTransaction.create([{
                        userId: booking.userId,
                        bookingId: booking._id,
                        amount: onlinePaymentAmount,
                        description: `Booking failed due to insufficient wallet funds. System refund for online payment.`
                    }], { session });

                    booking.status = 'canceled';
                    await booking.save({ session });
                    await session.commitTransaction();

                    await sendNotification(req, {
                        recipientId: booking.userId,
                        title: "Booking Failed ❌",
                        message: `Your reservation at ${booking.restaurantId.restaurantName} could not be confirmed because your wallet balance changed. The ₹${onlinePaymentAmount} you paid online has been added to your wallet.`
                    });

                    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
                        success: false, 
                        message: "Insufficient wallet balance. Payment credited to wallet." 
                    });
                }
            }

            // 2. Safety Check: Are the seats still available? 
            // (Seat hold might have expired while the user was performing the payment)
            const availableSeats = await getRealTimeAvailability(
                booking.restaurantId._id, 
                booking.bookingDate, 
                booking.slotTime, 
                booking.userId
            );

            if (availableSeats < booking.guests) {
                // FAIL CASE: Double booking prevented!
                // Seats were taken while payment was being processed. Refund online payment to wallet.
                const onlinePaymentAmount = booking.totalAmount - booking.walletAmountUsed;
                await User.findByIdAndUpdate(booking.userId, { 
                    $inc: { walletBalance: onlinePaymentAmount } 
                }, { session });

                await WalletTransaction.create([{
                    userId: booking.userId,
                    bookingId: booking._id,
                    amount: onlinePaymentAmount,
                    description: `Booking failed due to seat unavailability. System refund for online payment.`
                }], { session });

                booking.status = 'canceled';
                await booking.save({ session });
                await session.commitTransaction();

                await sendNotification(req, {
                    recipientId: booking.userId,
                    title: "Booking Failed ❌",
                    message: `The table at ${booking.restaurantId.restaurantName} is no longer available. The ₹${onlinePaymentAmount} you paid online has been added to your wallet.`
                });

                return res.status(STATUS_CODES.BAD_REQUEST).json({ 
                    success: false, 
                    message: "Seats are no longer available. Refunded to wallet." 
                });
            }

            // --- SUCCESS PATH ---
            booking.status = 'approved';
            booking.razorpayPaymentId = razorpay_payment_id;

            const user = await User.findById(booking.userId).session(session);

            if (booking.walletAmountUsed > 0) {
                if (!user || user.walletBalance < booking.walletAmountUsed) {
                    throw new Error("Insufficient wallet balance at time of confirmation.");
                }

                user.walletBalance -= booking.walletAmountUsed;
                await user.save({ session });

                const walletTx = await WalletTransaction.create([{
                    userId: booking.userId,
                    bookingId: booking._id,
                    amount: -booking.walletAmountUsed,
                    description: `Used wallet for booking at ${booking.restaurantId.restaurantName}`
                }], { session });

                booking.walletTransactionId = walletTx[0]._id;
            }

            await booking.save({ session });
            await session.commitTransaction();

            // Release the seat hold since the booking is now confirmed in the database
            if (booking.holdKey) {
                await redisClient.del(booking.holdKey);
            }

            // Send notification
            await sendNotification(req, {
                recipientId: booking.userId,
                title: "Payment Successful! 💳",
                message: `Your booking at ${booking.restaurantId.restaurantName} is confirmed for ${new Date(booking.bookingDate).toLocaleDateString()} at ${format12hr(booking.slotTime)}.`
            });

            // Send Confirmation Email
            try {
                const html = getBookingConfirmationEmailTemplate(booking, { restaurantName: booking.restaurantId.restaurantName }, user.fullName);
                const subject = `Booking Confirmed: ${booking.restaurantId.restaurantName}`;
                const text = `Your booking at ${booking.restaurantId.restaurantName} is confirmed for ${new Date(booking.bookingDate).toLocaleDateString()}.`;
                await sendEmail(user.email, subject, text, html);
            } catch (emailError) {
                console.error("Email Error:", emailError);
            }

            res.status(STATUS_CODES.OK).json({
                success: true,
                message: "Payment successful!",
                bookingId: booking._id
            });
        } else {
            await session.abortTransaction();
            res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Verification Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Verification failed"
        });
    } finally {
        session.endSession();
    }
};
