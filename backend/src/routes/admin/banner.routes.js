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

const router = express.Router();
const upload = multer({ storage: storage });

router.use(verifyRole(ROLES.ADMIN));

router.post("/", upload.single("image"), createBanner);
router.get("/", getAllBanners);
router.patch("/:id/toggle", toggleBannerStatus);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
