import mongoose, { Schema } from "mongoose";

const wishlistSchema = new Schema(
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
        items: [
            {
                dishId: {
                    type: Schema.Types.ObjectId, // No ref needed as dishes are sub-docs in Restaurant
                    required: true,
                },
                qty: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        mealType: {
            type: String,
            enum: ["Breakfast", "Lunch", "Dinner"],
            required: true,
        },
    },
    { timestamps: true }
);

wishlistSchema.index({ userId: 1, restaurantId: 1 });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);