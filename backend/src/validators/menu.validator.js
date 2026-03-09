import { z } from "zod";

export const menuItemSchema = z.object({
    name: z.string().min(1, "Item name is required").max(100, "Item name too long"),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    description: z.string().max(500, "Description too long").optional(),
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
