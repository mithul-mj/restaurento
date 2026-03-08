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
            type: Number, // Stored as minutes since midnight (e.g. 840 for 2:00 PM)
            required: true,
        },
        slotEndTime: {
            type: Number, // Exact minute the table should be cleared
            required: true,
        },
        guests: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: ["approved", "canceled"],
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

export const Booking = mongoose.model("Booking", bookingSchema);
