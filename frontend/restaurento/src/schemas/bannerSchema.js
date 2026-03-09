import { z } from "zod";

export const bannerSchema = z.object({
    targetLink: z.string().url("Invalid target link URL").max(255, "Link too long").optional().or(z.literal("")),
    isActive: z.boolean().optional(),
    image: z.any().optional(),
});
