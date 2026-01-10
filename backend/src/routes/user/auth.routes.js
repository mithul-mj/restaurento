import express, { Router } from "express";
import {
  registerUser,
  loginUser,
  logout,
  googleAuthUser,
  getProfile,
} from "../../controllers/user/userAuth.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
} from "../../validators/common.schemas.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logout);
router.post("/auth/google", googleAuthUser);
router.get("/profile", verifyJWT, getProfile);

export default router;
