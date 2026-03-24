import express from "express";
import { 
    getRestaurantProfile, 
    updateRestaurantSettings, 
    getMenu, 
    toggleItemAvailability, 
    updateMenuItem, 
    addMenuItem, 
    deleteMenuItem, 
    updateRestaurantProfile, 
    verifyCheckIn,
    getRestaurantBookings,
    getBookingById,
    updateBookingStatus,
    getRestaurantStats,
    getRestaurantEarnings
} from "../../controllers/restaurant/restaurant.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import ROLES from "../../constants/roles.js";

import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { menuItemSchema, updateMenuItemSchema } from "../../validators/menu.validator.js";

const router = express.Router();
const upload = multer({ storage: storage });

router.use(verifyRole(ROLES.RESTAURANT));

router.get("/profile", getRestaurantProfile);
router.patch("/profile", upload.array("images", 5), updateRestaurantProfile);
router.patch("/settings", updateRestaurantSettings);
router.get("/stats", getRestaurantStats);
router.get("/earnings", getRestaurantEarnings);

router.get("/menu", getMenu);
router.post("/menu", upload.single("image"), validate(menuItemSchema), addMenuItem);
router.patch("/menu/:itemId", upload.single("image"), validate(updateMenuItemSchema), updateMenuItem);
router.patch("/menu/:itemId/toggle-availability", toggleItemAvailability);
router.delete("/menu/:itemId", deleteMenuItem)
router.get("/bookings", getRestaurantBookings);
router.get("/bookings/:bookingId", getBookingById);
router.patch("/bookings/:bookingId/status", updateBookingStatus);
router.post("/bookings/verify-checkin", verifyCheckIn);

export default router;
