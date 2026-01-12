import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { env } from "./env.config.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurento/onboading",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "avif", "webp"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

export { cloudinary, storage };
