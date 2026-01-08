import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
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
        issueType: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [{ type: String }],
        status: {
            type: String,
            enum: ["pending", "resolved"],
            default: "pending",
            required: true,
        },
        adminNote: {
            type: String,
        },
    },
    { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
