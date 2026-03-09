import express from "express";
import {
  verifyEmail,
  forgotPassword,
  refreshAccessToken,
  resendOtp,
  resetPasswordWithLink,
} from "../../controllers/commonAuth.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";
import {
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../../validators/auth.validator.js";

const router = express.Router();

router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/refresh-token", refreshAccessToken);

router.patch("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password-link", validate(resetPasswordSchema), resetPasswordWithLink);

export default router;
