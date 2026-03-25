import { z } from "zod";

export const onboardingSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name is required").optional(),
  restaurantPhone: z.string().min(10, "Valid phone number is required").optional(),
  description: z.string().max(500, "Description too long").optional(),
  address: z.string().min(5).optional(),

  longitude: z.coerce.number().min(-180).max(180).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),

  totalSeats: z.coerce.number().min(1, "At least 1 seat required").max(1000, "Maximum limit is 1000 seats"),
  slotPrice: z.coerce.number().min(0, "Price cannot be negative").max(10000, "Price per person cannot exceed 10000"),

  tags: z.array(z.string()).optional(),

  slotConfig: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.object({
      duration: z.coerce.number().default(60),
      gap: z.coerce.number().default(0),
    })
  ),

  openingHours: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.object({
      isSameEveryDay: z.boolean().default(false),
      days: z
        .array(
          z.object({
            startTime: z.string().optional(),
            endTime: z.string().optional(),
            isClosed: z.boolean().default(false),
            generatedSlots: z.array(
              z.object({
                startTime: z.number(),
                endTime: z.number()
              })
            ).optional()
          })
        )
        .length(7, "Opening hours for all 7 days are required"),
    })
  ),

  menuItems: z
    .array(
      z.object({
        name: z.string().min(1, "Item name is required").max(30, "Name too long (Max 30)"),
        price: z.coerce.number().min(1, "At least 1 required").max(10000, "Price per dish cannot exceed 10000"),
        description: z.string().min(5, "Description required (Min 5 chars)").max(100, "Description too long (Max 100)"),
        categories: z.array(z.string()).optional(),
      })
    )
    .optional(),

  files: z
    .object({
      images: z.array(z.any()).min(3, "At least three gallery images are required"),
      restaurantLicense: z.array(z.any()).optional(),
      businessCert: z.array(z.any()).optional(),
      fssaiCert: z.array(z.any()).optional(),
      ownerIdCert: z.array(z.any()).optional(),
    })
    .optional(),
});

export const preApprovalSchema = z.object({
  restaurantName: z.string().min(3, "Restaurant Name must be at least 3 characters").max(30, "Name too long"),
  restaurantPhone: z.string().regex(/^\d+$/, "Phone must contain only numbers").length(10, "Phone must be exactly 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters").max(70, "Address too long"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  files: z.object({
    restaurantLicense: z.array(z.any()).optional(),
    businessCert: z.array(z.any()).optional(),
    fssaiCert: z.array(z.any()).optional(),
    ownerIdCert: z.array(z.any()).optional(),
  }).optional()
});
