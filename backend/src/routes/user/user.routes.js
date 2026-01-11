import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
    changeEmail,
    getProfile,
    updateProfile,
    verifyEmailChange,
} from "../../controllers/user/userProfile.controller.js";
import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";

const upload = multer({ storage });

const router = express.Router();

router.get("/profile", verifyJWT, getProfile);

router.put("/profile", verifyJWT, upload.single("avatar"), updateProfile);

router.patch("/profile/change-email/request", verifyJWT, changeEmail);
router.patch("/profile/change-email/verify", verifyJWT, verifyEmailChange);

export default router;
