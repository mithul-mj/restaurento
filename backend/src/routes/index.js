import express from "express";

import userAuthRoutes from "./user/auth.routes.js";
import adminAuthRoutes from "./admin/auth.routes.js";
import restaurantAuthRoutes from "./restaurant/auth.routes.js";
import errorHandler from "../middlewares/errorHandler.middleware.js";
import commonAuthRoutes from "./common/auth.routes.js";
import onboardingRoutes from "./restaurant/onboarding.routes.js";

const router = express.Router();

router.use("/api/v1/auth/", commonAuthRoutes);
router.use("/api/v1/", userAuthRoutes);
router.use("/api/v1/admin", adminAuthRoutes);
router.use("/api/v1/restaurant", restaurantAuthRoutes);
router.use("/api/v1/restaurant", onboardingRoutes);

router.use(errorHandler);

export default router;
