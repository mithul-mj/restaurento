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
            enum: ["approved", "canceled", "checked-in"],
            default: "approved",
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
            required: true,
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

bookingSchema.pre('save', function () {
    if (this.isNew) {
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
