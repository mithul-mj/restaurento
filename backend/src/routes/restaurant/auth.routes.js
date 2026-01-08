import express from "express";
import {
  registerRestaurant,
  loginRestaurant,
  googleAuthRestaurant,
} from "../../controllers/restaurant/restaurantAuth.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
} from "../../validators/common.schemas.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerRestaurant);
router.post("/login", validate(loginSchema), loginRestaurant);
router.post("/auth/google", googleAuthRestaurant);

export default router;
