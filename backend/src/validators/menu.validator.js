import { z } from "zod";

export const menuItemSchema = z.object({
    name: z.string().min(1, "Item name is required").max(30, "Name too long (Max 30)"),
    price: z.coerce.number().min(1, "Price must be at least 1").max(10000, "Price per dish cannot exceed 10000"),
    file: z.any().refine((f) => !!f, "Dish image is required"),
    description: z.string().min(5, "Description required (Min 5 chars)").max(100, "Description too long (Max 100)"),
    categories: z.preprocess(
        (val) => {
            if (val === undefined || val === null) return val;
            if (typeof val === "string") return [val];
            return val;
        },
        z.array(z.string().max(50, "Category too long")).min(1, "Select at least one category")
    ),
    isAvailable: z.preprocess(
        (val) => {
            if (val === undefined || val === null) return val;
            return val === "true" || val === true;
        },
        z.boolean().optional()
    ).default(true),
});

export const updateMenuItemSchema = menuItemSchema.partial();
