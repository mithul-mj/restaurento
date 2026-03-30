import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        recipientId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "recipientModel", // Dynamic reference
        },
        recipientModel: {
            type: String,
            required: true,
            enum: ["USER", "RESTAURANT"],
        },

        title: {
            type: String,
        },
        message: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            enum: ["BOOKING", "WALLET", "PROMOTION", "SYSTEM", "RESTAURANT"],
            default: "SYSTEM"
        },
        link: {
            type: String, // e.g., /my-bookings/69c4bf0...
        }

    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
