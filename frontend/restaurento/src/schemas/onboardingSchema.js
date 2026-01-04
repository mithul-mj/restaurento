import { z } from "zod";

// Update regex to support HH:MM 24-hour format
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const singleDishSchema = z.object({
    name: z.string().min(1, "Name required"),
    price: z.coerce.number({ invalidTypeError: "Price required" }).positive("Price must be greater than 0"),
    description: z.string().optional(),
    // Update image to be required if needed
    image: z.any().refine((files) => files && files.length > 0, "Image is required"),
    categories: z.array(z.string()).min(1, "Select at least one category")
});


export const stepSchemas = [
    // Step 1: Basic Info & Time
    z.object({
        restaurantName: z.string().min(2, "Name is required"),
        restaurantPhone: z.string().min(10, "Invalid phone number"),
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
                    startTime: z.string(),
                    endTime: z.string()
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
    // Step 2: Seating & Photos & Location
    z.object({
        totalSeats: z.coerce.number().min(1, "Required"),
        images: z.any().refine((files) => files?.length >= 3, "Upload at least 3 photos"),
        address: z.string().min(5, "Address is required"),
        latitude: z.coerce.number({ invalidTypeError: "Latitude must be a number" }).min(-90, "Invalid latitude").max(90, "Invalid latitude"),
        longitude: z.coerce.number({ invalidTypeError: "Longitude must be a number" }).min(-180, "Invalid longitude").max(180, "Invalid longitude")
    }),
    // Step 3: Legal & Verification
    z.object({
        restaurantLicense: z.any().refine((files) => files && files.length > 0, "Restaurant License is required"),
        businessCert: z.any().refine((files) => files && files.length > 0, "Business Certificate is required"),
        fssaiCert: z.any().refine((files) => files && files.length > 0, "FSSAI Certificate is required"),
        ownerIdCert: z.any().refine((files) => files && files.length > 0, "Owner ID Proof is required"),
    }),
    // Step 4: Menu & Slot Rates
    z.object({
        menuItems: z.array(singleDishSchema).min(1, "Add at least one menu item"),
        slotPrice: z.coerce.number().min(0, "Slot price required"),
    }),
    // Step 5: Final Review
    z.object({
        termsAccepted: z.boolean().refine(val => val === true, "Must accept terms")
    })
];

export const onboardingSchema = stepSchemas.reduce((acc, schema) => acc.merge(schema), z.object({}));