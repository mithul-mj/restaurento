import { z } from "zod";

const preApprovalSchema = z.object({
    restaurantName: z.string().min(3, "Restaurant Name must be at least 3 characters"),
    restaurantPhone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    latitude: z.preprocess((val) => Number(val), z.number({ required_error: "Location is required" }).min(-90).max(90)),
    longitude: z.preprocess((val) => Number(val), z.number({ required_error: "Location is required" }).min(-180).max(180)),
    restaurantLicense: z.any().refine((file) => !!file, "Restaurant License is required"),
    businessCert: z.any().refine((file) => !!file, "Business Certificate is required"),
    fssaiCert: z.any().refine((file) => !!file, "FSSAI Certificate is required"),
    ownerIdCert: z.any().refine((file) => !!file, "Owner ID is required"),
});

export default preApprovalSchema;