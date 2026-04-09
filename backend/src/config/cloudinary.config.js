import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { env } from "./env.config.js";
import { ERROR_MESSAGES } from "../constants/messages.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurento/onboarding",
    allowed_formats: ["jpg", "png", "jpeg", "avif", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }],
  },
});

const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurento/banners",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
    transformation: [
      { width: 2200, crop: "limit", quality: "auto:best", fetch_format: "auto" }
    ],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
  }
};

export { cloudinary, storage, bannerStorage, fileFilter };
