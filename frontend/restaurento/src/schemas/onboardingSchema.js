import { z } from "zod";

// Update regex to support HH:MM 24-hour format
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const singleDishSchema = z.object({
    name: z.string().min(1, "Name required"),
    price: z.coerce.number({ invalidTypeError: "Price required" }).positive("Price must be greater than 0"),
    description: z.string().optional(),
    // Update image to be required if needed
    image: z.any().refine((file) => !!file, "Image is required"),
    categories: z.array(z.string()).min(1, "Select at least one category")
});


export const stepSchemas = [
    z.object({
        description: z.string().min(10, "Description is required (min 10 characters)").max(500, "Max 500 characters"),
        tags: z.array(z.string()).min(1, "Select at least one cuisine tag"),

        // Configuration used to generate the slots
        slotConfig: z.object({
            duration: z.coerce.number().min(15, "Min 15 mins"),
            gap: z.coerce.number().min(0).default(0),
        }),

        openingHours: z.object({
            isSameEveryDay: z.boolean(),
            days: z.array(z.object({
                // No dayName - index determines day (0=Monday, 1=Tuesday, etc.)
                startTime: z.string().regex(timeRegex).optional().or(z.literal("")),
                endTime: z.string().regex(timeRegex).optional().or(z.literal("")),
                isClosed: z.boolean(),
                // Clean array for automated slots
                generatedSlots: z.array(z.object({
                    startTime: z.number(),
                    endTime: z.number()
                }))
            }))
        }).refine((data) => {
            if (data.isSameEveryDay) return !data.days[0].isClosed;
            return data.days.some(day => !day.isClosed);
        }, {
            message: "At least one business day must be open",
            path: ["days"]
        }),
    }),
    // Step 2: Seating & Photos
    z.object({
        totalSeats: z.coerce.number().min(1, "Required"),
        slotPrice: z.coerce.number().min(0, "Slot price required"),
        images: z.any().refine((files) => files?.length >= 3, "Upload at least 3 photos"),
    }),
    // Step 3: Menu & Slot Rates
    z.object({
        menuItems: z.array(singleDishSchema).min(1, "Add at least one menu item"),
    }),
    // Step 4: Final Review
    z.object({
        termsAccepted: z.boolean().refine(val => val === true, "Must accept terms")
    })
];

export const onboardingSchema = stepSchemas.reduce((acc, schema) => acc.merge(schema), z.object({}));