import { z } from "zod";

export const offerSchema = z.object({
    discountValue: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number({ required_error: "Discount value is required" }).min(1, "Minimum ₹1 discount")
    ),
    minOrderValue: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number().min(0, "Minimum order value cannot be negative").optional()
    ),
    usageLimit: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number({ required_error: "Usage limit is required" }).min(1, "Minimum 1 usage required")
    ),
    validFrom: z.string().optional().nullable(),
    validUntil: z.string().optional().nullable()
});

export const updateOfferSchema = offerSchema.partial();
