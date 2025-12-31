import { z } from "zod";

const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/;

export const onboardingSchema = [
    // Step 1: Basic Info
    z.object({
        restaurantName: z.string().min(2, "Name is required"),
        restaurantPhone: z.string().min(10, "Invalid phone number"),
        description: z.string().max(500, "Max 500 characters"),
        tags: z.array(z.string()).min(1, "Select at least one cuisine tag"),
        openingHours: z.object({
            isSameEveryDay: z.boolean(),
            slots: z.array(z.object({
                day: z.string(),
                open: z.string().regex(timeRegex, "Invalid time format"),
                close: z.string().regex(timeRegex, "Invalid time format"),
                isClosed: z.boolean()
            }))
        })
    }),
    // Step 2: Seating & Photos
    z.object({
        totalSeats: z.coerce.number().min(1, "Required"),
        images: z.array(z.any()).min(3, "Upload at least 3 photos")
    }),
    // Step 3: Legal
    z.object({
        licenseNumber: z.string().min(5, "Required"),
        businessCert: z.any().refine((file) => file?.length > 0, "Certificate is required")
    })
];