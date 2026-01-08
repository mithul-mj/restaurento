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
            enum: ["User", "Restaurant"],
        },
        title: {
            type: String,
        },
        message: {
            type: String,
        },
        type: {
            type: String, // e.g. 'booking_alert', 'promo'
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
