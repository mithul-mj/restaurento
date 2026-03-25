import { z } from "zod";

export const offerSchema = z.object({
    discountValue: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number({ required_error: "Discount amount is required" }).min(1, "Minimum ₹1 discount").max(1000, "Discount cannot exceed ₹1000")
    ),
    minOrderValue: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number().min(0, "Cannot be negative").max(5000, "Bill threshold cannot exceed ₹5000").optional()
    ),
    validFrom: z.string().optional().nullable(),
    validUntil: z.string().optional().nullable()
}).refine((data) => {
    const discount = data.discountValue || 0;
    const minBill = data.minOrderValue || 0;
    return discount < minBill;
}, {
    message: "Discount must be less than the minimum bill",
    path: ["discountValue"]
}).refine((data) => {
    if (!data.validUntil || !data.validFrom) return true;
    return new Date(data.validUntil) > new Date(data.validFrom);
}, {
    message: "Expiry date must be after the start date",
    path: ["validUntil"]
});

export const updateOfferSchema = offerSchema.partial();
