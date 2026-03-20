import { z } from "zod";

export const couponSchema = z.object({
    code: z.string({ required_error: "Coupon code is required" })
        .min(3, "Code must be at least 3 characters")
        .max(15, "Code is too long")
        .trim(),

    description: z.string().max(500, "Description is too long").optional(),

    discountValue: z.preprocess(
        (val) => (typeof val === 'string' && val === "" ? undefined : Number(val)),
        z.number({ required_error: "Discount percentage is required" })
            .min(1, "Discount must be at least 1%")
            .max(100, "Discount cannot exceed 100%")
    ),

    maxDiscountCap: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number().min(0, "Cap cannot be negative").optional()
    ),

    minOrderValue: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number().min(0, "Minimum order cannot be negative").default(0).optional()
    ),

    expiryDate: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.coerce.date().min(new Date(new Date().setHours(0, 0, 0, 0)), "Expiry date cannot be in the past").optional()
    ),

    usageLimit: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number().min(1, "Usage limit must be at least 1").optional()
    ),

    isActive: z.boolean().default(true).optional()
});

export const updateCouponSchema = couponSchema.partial();
