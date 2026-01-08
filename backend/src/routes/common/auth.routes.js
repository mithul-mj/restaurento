import express from "express";
import {
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  resendOtp,
} from "../../controllers/commonAuth.controller.js";

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshAccessToken);


export default router;
