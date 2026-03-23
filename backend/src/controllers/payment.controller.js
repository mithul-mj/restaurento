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
            const redisKey = `pending_booking:${razorpay_order_id}`;
            const rawData = await redisClient.get(redisKey);

            if (!rawData) {
                await session.abortTransaction();
                return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Booking session expired." });
            }

            const data = JSON.parse(rawData);

            const booking = new Booking({
                ...data,
                razorpayPaymentId: razorpay_payment_id
            });

            if (data.walletAmountUsed > 0) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: data.userId, walletBalance: { $gte: data.walletAmountUsed } },
                    { $inc: { walletBalance: -data.walletAmountUsed } },
                    { session, new: true }
                );

                if (!updatedUser) {
                    throw new Error("Insufficient wallet balance at time of confirmation.");
                }

                const walletTx = await WalletTransaction.create([{
                    userId: data.userId,
                    bookingId: booking._id,
                    amount: -data.walletAmountUsed,
                    description: `Used wallet for booking at ${data.restaurantName}`
                }], { session });

                booking.walletTransactionId = walletTx[0]._id;
            }

            await booking.save({ session });
            await session.commitTransaction();
            await redisClient.del(redisKey);

            // Release the seat hold since the booking is now confirmed in the database
            if (data.holdKey) {
                await redisClient.del(data.holdKey);
            }

            // Send notification
            await sendNotification(req, {
                recipientId: data.userId,
                title: "Payment Successful! 💳",
                message: `Your booking at ${data.restaurantName} is confirmed for ${new Date(booking.bookingDate).toLocaleDateString()} at ${format12hr(booking.slotTime)}.`
            });




            // Send Confirmation Email using in-memory data

            try {
                const html = getBookingConfirmationEmailTemplate(booking, { restaurantName: data.restaurantName }, req.user.fullName);
                const subject = `Booking Confirmed: ${data.restaurantName}`;
                const text = `Your booking at ${data.restaurantName} is confirmed for ${new Date(booking.bookingDate).toLocaleDateString()}.`;
                await sendEmail(req.user.email, subject, text, html);
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
