import { z } from "zod";

export const menuSchema = z.object({
    name: z.string().min(1, "Item name is required").max(30, "Name too long (Max 30)"),
    price: z.coerce.number({ invalidTypeError: "Price required" }).min(1, "At least 1 required").max(10000, "Price per dish cannot exceed 10000"),
    description: z.string().min(5, "Description required (Min 5 chars)").max(100, "Description too long (Max 100)"),
    categories: z.array(z.string().max(50, "Category name too long")).min(1, "Select at least one category"),
    image: z.any().refine((file) => !!file, "Dish image is required"),
});

export const updateMenuSchema = menuSchema.partial();
