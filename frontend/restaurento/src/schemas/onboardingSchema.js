import { z } from "zod";

// Update regex to support HH:MM 24-hour format
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const stepSchemas = [
    // Step 1: Basic Info
    z.object({
        restaurantName: z.string().min(2, "Name is required"),
        restaurantPhone: z.string().min(10, "Invalid phone number"),
        description: z.string().max(500, "Max 500 characters").optional(),
        tags: z.array(z.string()).min(1, "Select at least one cuisine tag"),
        openingHours: z.object({
            isSameEveryDay: z.boolean(),
            slots: z.array(z.object({
                day: z.string(),
                open: z.string().regex(timeRegex, "Invalid time format (HH:MM)").optional().or(z.literal("")),
                close: z.string().regex(timeRegex, "Invalid time format (HH:MM)").optional().or(z.literal("")),
                isClosed: z.boolean()
            }))
        })
    }),
    // Step 2: Seating, Location & Photos
    z.object({
        totalSeats: z.coerce.number().min(1, "Required"),
        images: z.any().refine((files) => files?.length >= 3, "Upload at least 3 photos"),
        address: z.string().min(5, "Address is required"),
        location: z.object({
            lat: z.number(),
            lng: z.number()
        }).optional()
    }),
    // Step 3: Legal
    z.object({
        licenseNumber: z.string().min(5, "Required"),
        businessCert: z.any().optional(),
        fssaiCert: z.any().optional(),
        ownerIdCert: z.any().optional(),
    }),
    // Step 4: Menu & Slots
    z.object({
        menuItems: z.array(z.object({
            name: z.string().min(1, "Name required"),
            price: z.coerce.number().min(0, "Price must be positive"),
            description: z.string().optional(),
            image: z.any().optional()
        })),
        slotPrice: z.coerce.number().min(0, "Price required"),
        slotDuration: z.coerce.number().min(30).default(60),
        slotGap: z.coerce.number().default(0)
    }),
    // Step 5: Review (No specific internal validation needed usually, but good to have)
    z.object({
        termsAccepted: z.boolean().refine(val => val === true, "Must accept terms")
    })
];

export const onboardingSchema = stepSchemas.reduce((acc, schema) => acc.merge(schema), z.object({}));