import { Router } from "express";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import ROLES from "../../constants/roles.js";
import {
  getAllRestaurants,
  toggleRestaurantStatus,
  toggleRestaurantVerificationStatus,
  RestaurantDetails
} from "../../controllers/admin/restaurentManagement.controller.js";


const router = Router();

router.use(verifyRole(ROLES.ADMIN));

router.route("/").get(getAllRestaurants);

router.patch("/:restaurantId/toggle-status", toggleRestaurantStatus);

router.patch(
  "/:restaurantId/verification-status",
  toggleRestaurantVerificationStatus,
);

router.get("/:restaurantId", RestaurantDetails);

export default router;
