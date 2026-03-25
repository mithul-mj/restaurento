import { z } from "zod";

const preApprovalSchema = z.object({
    restaurantName: z.string().min(3, "Restaurant Name must be at least 3 characters").max(30, "Name too long"),
    restaurantPhone: z.string().regex(/^\d+$/, "Phone must contain only numbers").length(10, "Phone must be exactly 10 digits"),
    address: z.string().min(5, "Address must be at least 5 characters").max(70, "Address too long"),
    latitude: z.preprocess((val) => Number(val), z.number({ required_error: "Location is required" }).min(-90).max(90)),
    longitude: z.preprocess((val) => Number(val), z.number({ required_error: "Location is required" }).min(-180).max(180)),
    restaurantLicense: z.any().refine((file) => !!file, "Restaurant License is required"),
    businessCert: z.any().refine((file) => !!file, "Business Certificate is required"),
    fssaiCert: z.any().refine((file) => !!file, "FSSAI Certificate is required"),
    ownerIdCert: z.any().refine((file) => !!file, "Owner ID is required"),
});

export default preApprovalSchema;