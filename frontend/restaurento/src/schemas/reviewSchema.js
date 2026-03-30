import { z } from "zod";

export const reviewSchema = z.object({
    rating: z.number().int().min(1, "Please select at least 1 star").max(5, "Rating cannot exceed 5 stars"),
    comment: z.string().trim().min(10, "Your review must be at least 10 characters long").max(500, "Review cannot exceed 500 characters")
});
