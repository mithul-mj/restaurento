import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, "Comment cannot exceed 500 characters"],
        },
    },
    { timestamps: true }
);

// Composite unique index to ensure one user can only review a restaurant once
reviewSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
