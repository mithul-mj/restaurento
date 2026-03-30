import { z } from "zod";

export const reviewSchema = z.object({
    restaurantId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Restaurant ID"),
    rating: z.preprocess((val) => Number(val), z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars")),
    comment: z.string().trim().min(10, "Review comment must be at least 10 characters").max(500, "Review comment cannot exceed 500 characters"),
});
