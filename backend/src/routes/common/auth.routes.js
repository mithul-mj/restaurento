import express from "express";
import {
  verifyEmail,
  forgotPassword,
  refreshAccessToken,
  resendOtp,
  resetPasswordWithLink,
} from "../../controllers/commonAuth.controller.js";

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/refresh-token", refreshAccessToken);

router.patch("/forgot-password", forgotPassword);
router.post("/reset-password-link", resetPasswordWithLink);

export default router;
