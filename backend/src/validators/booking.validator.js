import { z } from "zod";
import { MAX_FOOD_QUANTITY, MAX_PARTY_SIZE } from "../constants/constants.js";

export const createBookingSchema = z.object({
    restaurantId: z.string().min(24, "Invalid restaurant ID"),
    bookingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }),
    slotTime: z.number().int().min(0, "Invalid slot time"),
    guests: z.number().int().min(1, "At least 1 guest is required").max(MAX_PARTY_SIZE, `Maximum party size is ${MAX_PARTY_SIZE}`),
    preOrderItems: z
        .array(
            z.object({
                dishId: z.string().min(24, "Invalid dish ID"),
                name: z.string().min(1, "Dish name is required"),
                qty: z.number().int().min(1, "Quantity must be at least 1").max(MAX_FOOD_QUANTITY, `Maximum quantity per item is ${MAX_FOOD_QUANTITY}`),
                priceAtBooking: z.number().min(0, "Price cannot be negative"),
            })
        )
        .optional()
        .default([]),
});
