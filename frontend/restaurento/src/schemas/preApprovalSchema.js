import { z } from "zod";

const preApprovalSchema = z.object({
    restaurantName: z.string().min(3, "Restaurant Name must be at least 3 characters"),
    restaurantPhone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    latitude: z.string().or(z.number()).optional(),
    longitude: z.string().or(z.number()).optional(),
    restaurantLicense: z.any().refine((files) => files && files.length > 0, "Restaurant License is required"),
    businessCert: z.any().refine((files) => files && files.length > 0, "Business Certificate is required"),
    fssaiCert: z.any().refine((files) => files && files.length > 0, "FSSAI Certificate is required"),
    ownerIdCert: z.any().refine((files) => files && files.length > 0, "Owner ID is required"),
});

export default preApprovalSchema;
