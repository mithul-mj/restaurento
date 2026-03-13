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

const razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(STATUS_CODES.NOT_FOUND).json({
            success: false,
            message: "booking not found"
        });

        const amountToPay = booking.totalAmount - (booking.walletAmountUsed || 0);

        if (amountToPay <= 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "This booking is already fully covered by wallet balance."
            });
        }

        const options = {
            amount: Math.round(amountToPay * 100),
            currency: "INR",
            receipt: `receipt_${booking._id}`,
        }
        const order = await razorpayInstance.orders.create(options);
        res.status(STATUS_CODES.OK).json({ success: true, order });
    } catch (error) {
        console.log("Razorpay Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Could not create payment order"
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const booking = await Booking.findById(bookingId)
                .session(session)
                .populate('userId', 'fullName email')
                .populate('restaurantId', 'restaurantName');

            if (!booking) {
                await session.abortTransaction();
                return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: "Booking not found" });
            }

            // 1. Update booking status
            booking.paymentStatus = 'paid';
            booking.razorpayPaymentId = razorpay_payment_id;

            // 2. Deduct wallet if applicable
            if (booking.walletAmountUsed > 0) {
                const user = await User.findById(booking.userId._id).session(session);
                if (user) {
                    user.walletBalance -= booking.walletAmountUsed;
                    await user.save({ session });

                    const walletTx = await WalletTransaction.create([{
                        userId: user._id,
                        bookingId: booking._id,
                        amount: -booking.walletAmountUsed,
                        description: `Used wallet for booking at ${booking.restaurantId.restaurantName}`
                    }], { session });

                    booking.walletTransactionId = walletTx[0]._id;
                }
            }

            await booking.save({ session });
            await session.commitTransaction();

            // 3. Send Confirmation Email (Async)
            try {
                const restaurant = booking.restaurantId;
                const user = booking.userId;
                const html = getBookingConfirmationEmailTemplate(booking, restaurant, user.fullName);
                const subject = `Booking Confirmed: ${restaurant.restaurantName}`;
                const text = `Your booking at ${restaurant.restaurantName} is confirmed for ${new Date(booking.bookingDate).toLocaleDateString()}.`;
                await sendEmail(user.email, subject, text, html);
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
            }

            res.status(STATUS_CODES.OK).json({ success: true, message: "Payment successful!" });
        } else {
            await session.abortTransaction();
            res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Verification Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: "Verification failed" });
    } finally {
        session.endSession();
    }
};
