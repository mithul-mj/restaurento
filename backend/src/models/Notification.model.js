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

    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
