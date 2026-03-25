import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import { env } from "../config/env.config.js";

const bookingSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        bookingDate: {
            type: Date,
            required: true,
        },
        slotTime: {
            type: Number,
            required: true,
        },
        slotEndTime: {
            type: Number,
            required: true,
        },
        guests: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: ["pending-payment", "approved", "canceled", "checked-in"],
            default: "pending-payment",
            required: true,
        },
        canceledBy: {
            type: String,
            enum: ["USER", "RESTAURANT"],
            default: null,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        slotPrice: {
            type: Number,
            required: true,
        },
        tax: {
            type: Number,
            required: true,
        },
        platformFee: {
            type: Number,
            required: true,
        },
        checkInToken: {
            type: String,
            unique: true,
        },
        walletTransactionId: {
            type: Schema.Types.ObjectId,
            ref: "WalletTransaction",
        },
        razorpayOrderId: {
            type: String,
        },
        razorpayPaymentId: {
            type: String,
        },
        walletAmountUsed: {
            type: Number,
            default: 0,
        },
        appliedCoupon: {
            couponId: {
                type: Schema.Types.ObjectId,
                ref: "Coupon",
                default: null,
            },
            code: { type: String },
            discountValue: { type: Number }, // Represents the percentage
            discountAmountApplied: { type: Number }, // Actual currency saved
        },
        appliedOffer: {
            offerId: {
                type: Schema.Types.ObjectId,
                ref: "Offer",
                default: null,
            },
            discountValue: { type: Number }, // The flat amount saved
        },
        preOrderItems: [
            {
                dishId: { type: Schema.Types.ObjectId },
                name: { type: String },
                qty: { type: Number, required: true },
                priceAtBooking: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true }
);

// Optimization for high-speed lookups across coupons, analytics, and booking history
bookingSchema.index({ "appliedCoupon.couponId": 1, status: 1 });
bookingSchema.index({ "appliedOffer.offerId": 1, status: 1 });
bookingSchema.index({ restaurantId: 1, bookingDate: 1, status: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

// TTL Index: Auto-delete bookings that stay in "pending-payment" for more than 30 minutes
bookingSchema.index({ createdAt: 1 }, { 
    expireAfterSeconds: 1800, 
    partialFilterExpression: { status: "pending-payment" } 
});

bookingSchema.pre('save', function () {
    // Only generate the check-in token if confirmed and not already set
    if (this.status === 'approved' && !this.checkInToken) {
        const payload = {
            bid: this._id,
            rid: this.restaurantId,
            uid: this.userId,
            exp: Math.floor(new Date(this.bookingDate).getTime() / 1000) + (this.slotEndTime * 60)
        };
        this.checkInToken = jwt.sign(payload, env.QR_CODE_SECRET);
    }
});

export const Booking = mongoose.model("Booking", bookingSchema);
