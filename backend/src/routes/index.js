import express from "express";

import userAuthRoutes from "./user/auth.routes.js";
import userProfileRoutes from "./user/user.routes.js";
import userPaymentRoutes from "./user/payment.routes.js";
import adminAuthRoutes from "./admin/auth.routes.js";
import restaurantAuthRoutes from "./restaurant/auth.routes.js";
import errorHandler from "../middlewares/errorHandler.middleware.js";
import commonAuthRoutes from "./common/auth.routes.js";
import onboardingRoutes from "./restaurant/onboarding.routes.js";
import restaurantRoutes from "./restaurant/restaurant.routes.js";
import restaurantOfferRoutes from "./restaurant/offer.routes.js";
import adminUserMangementRoutes from "../routes/admin/userManagement.routes.js";
import adminRestaurantManagementRoutes from "../routes/admin/restaurantManagement.routes.js";
import bannerRoutes from "../routes/admin/banner.routes.js";
import couponRoutes from "../routes/admin/coupon.routes.js";
import adminPaymentRoutes from "../routes/admin/paymentManagement.routes.js";
import adminDashboardRoutes from "../routes/admin/dashboard.routes.js";

const router = express.Router();

// Specific routes first to prevent broad matches from intercepting
router.use("/api/v1/auth/", commonAuthRoutes);
router.use("/api/v1/admin/users", adminUserMangementRoutes);
router.use("/api/v1/admin/restaurants", adminRestaurantManagementRoutes);
router.use("/api/v1/admin/banners", bannerRoutes);
router.use("/api/v1/admin/coupons", couponRoutes);
router.use("/api/v1/admin/payments", adminPaymentRoutes);
router.use("/api/v1/admin/dashboard", adminDashboardRoutes);
router.use("/api/v1/admin", adminAuthRoutes);

router.use("/api/v1/restaurant", restaurantAuthRoutes);
router.use("/api/v1/restaurant", onboardingRoutes);
router.use("/api/v1/restaurant/offers", restaurantOfferRoutes);
router.use("/api/v1/restaurant", restaurantRoutes);

router.use("/api/v1/", userAuthRoutes);
router.use("/api/v1/", userProfileRoutes);
router.use("/api/v1/", userPaymentRoutes);

router.use(errorHandler);

export default router;
