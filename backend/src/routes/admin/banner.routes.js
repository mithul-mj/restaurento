import express from "express";
import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import ROLES from "../../constants/roles.js";
import {
    createBanner,
    getAllBanners,
    toggleBannerStatus,
    deleteBanner,
    updateBanner
} from "../../controllers/admin/banner.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { bannerSchema, updateBannerSchema } from "../../validators/banner.validator.js";

const router = express.Router();
const upload = multer({ storage: storage });

router.use(verifyRole(ROLES.ADMIN));

router.post("/", upload.single("image"), validate(bannerSchema), createBanner);
router.get("/", getAllBanners);
router.patch("/:id/toggle", toggleBannerStatus);
router.put("/:id", upload.single("image"), validate(updateBannerSchema), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
