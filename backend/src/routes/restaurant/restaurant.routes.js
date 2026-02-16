import express from "express";
import { getRestaurantProfile, updateRestaurantSettings, getMenu, toggleItemAvailability, updateMenuItem, addMenuItem, deleteMenuItem, updateRestaurantProfile } from "../../controllers/restaurant/restaurant.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import ROLES from "../../constants/roles.js";

import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";

const router = express.Router();
const upload = multer({ storage: storage });

router.use(verifyRole(ROLES.RESTAURANT));

router.get("/profile", getRestaurantProfile);
router.patch("/profile", upload.array("images", 5), updateRestaurantProfile);
router.patch("/settings", updateRestaurantSettings);

router.get("/menu", getMenu);
router.post("/menu", upload.single("image"), addMenuItem);
router.patch("/menu/:itemId", upload.single("image"), updateMenuItem);
router.patch("/menu/:itemId/toggle-availability", toggleItemAvailability);
router.delete("/menu/:itemId", deleteMenuItem)

export default router;
