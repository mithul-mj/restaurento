import mongoose, { Schema } from "mongoose";

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
            type: Number, // e.g. 1400 for 2:00 PM
            required: true,
        },
        guests: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "completed", "canceled"],
            default: "pending",
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
        preOrderItems: [
            {
                dishId: { type: Schema.Types.ObjectId }, // Could verify against restaurant menu if needed
                name: { type: String }, // Store snapshot of name just in case
                qty: { type: Number, required: true },
                priceAtBooking: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
