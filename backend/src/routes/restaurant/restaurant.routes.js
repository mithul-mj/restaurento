import express from "express";
import { getRestaurantProfile } from "../../controllers/restaurant/restaurant.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import ROLES from "../../constants/roles.js";

const router = express.Router();

router.use(verifyRole(ROLES.RESTAURANT));

router.get("/profile", getRestaurantProfile);

export default router;
