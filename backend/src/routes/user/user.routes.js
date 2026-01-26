import express from "express";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import {
    changeEmail,
    getProfile,
    updateProfile,
    verifyEmailChange,
} from "../../controllers/user/userProfile.controller.js";
import { getUserDashboard } from "../../controllers/user/userDashboardController.js";
import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";
import ROLES from "../../constants/roles.js";

const upload = multer({ storage });

const router = express.Router();

router.get("/dashboard", getUserDashboard);

// Protected routes
router.use(verifyRole(ROLES.USER));

router.get("/profile", getProfile);

router.put("/profile", upload.single("avatar"), updateProfile);

router.patch("/profile/change-email/request", changeEmail);
router.patch("/profile/change-email/verify", verifyEmailChange);

export default router;
