import { z } from "zod";

export const menuSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    description: z.string().max(500, "Description too long").optional(),
    categories: z.array(z.string().max(50, "Category name too long")).min(1, "Select at least one category"),
    image: z.any().optional(), // Image might already be on the server or a new file
});

export const updateMenuSchema = menuSchema.partial();
