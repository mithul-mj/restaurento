import { z } from "zod";

export const createBookingSchema = z.object({
    restaurantId: z.string().min(24, "Invalid restaurant ID"),
    bookingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }),
    slotTime: z.number().int().min(0, "Invalid slot time"),
    guests: z.number().int().min(1, "At least 1 guest is required"),
    preOrderItems: z
        .array(
            z.object({
                dishId: z.string().min(24, "Invalid dish ID"),
                name: z.string().min(1, "Dish name is required"),
                qty: z.number().int().min(1, "Quantity must be at least 1"),
                priceAtBooking: z.number().min(0, "Price cannot be negative"),
            })
        )
        .optional()
        .default([]),
});
