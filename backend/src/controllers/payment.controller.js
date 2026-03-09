import Razorpay from 'razorpay';
import crypto from 'crypto'
import { env } from '../config/env.config.js';
import { Booking } from '../models/Booking.model.js';
import STATUS_CODES from '../constants/statusCodes.js';

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

        const options = {
            amount: Math.round(booking.totalAmount * 100),
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
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'paid',
                transactionId: razorpay_payment_id
            });

            res.status(STATUS_CODES.OK).json({ success: true, message: "Payment successful!" });
        } else {
            res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: "Verification failed" });
    }
};