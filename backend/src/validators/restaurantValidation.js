import { z } from "zod";

export const onboardingSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name is required"),
  restaurantPhone: z.string().min(10, "Valid phone number is required"),
  description: z.string().max(500, "Description too long").optional(),
  address: z.string().min(5, "Full address is required"),

  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),

  totalSeats: z.coerce.number().min(1, "Total seats must be at least 1"),
  slotPrice: z.coerce.number().min(0, "Slot price cannot be negative"),

  tags: z.array(z.string()).optional(),

  slotConfig: z.object({
    duration: z.coerce.number().default(60),
    gap: z.coerce.number().default(0),
  }),

  openingHours: z.object({
    isSameEveryDay: z.boolean().default(false),
    days: z
      .array(
        z.object({
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          isClosed: z.boolean().default(false),
        })
      )
      .length(7, "Opening hours for all 7 days are required"),
  }),

  menuItems: z
    .array(
      z.object({
        name: z.string().min(1, "Item name is required"),
        price: z.coerce.number().min(0),
        description: z.string().optional(),
        categories: z.array(z.string()).optional(),
      })
    )
    .optional(),

  files: z
    .object({
      images: z.array(z.any()).min(3, "At least three gallery images are required"),
      restaurantLicense: z
        .array(z.any())
        .min(1, "Restaurant License is required"),
      businessCert: z.array(z.any()).min(1, "Business Certificate is required"),
      fssaiCert: z.array(z.any()).min(1, "FSSAI Certificate is required"),
      ownerIdCert: z.array(z.any()).min(1, "Owner ID Certificate is required"),
    }),
});
