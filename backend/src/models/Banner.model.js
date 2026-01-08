import mongoose, { Schema } from "mongoose";

const bannerSchema = new Schema(
    {
        imageUrl: {
            type: String,
            required: true,
        },
        targetLink: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Banner = mongoose.model("Banner", bannerSchema);
