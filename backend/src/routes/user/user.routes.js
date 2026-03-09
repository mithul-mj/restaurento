import express from "express";
import {
    BookingRestaurant,
    getMyBookings,
    cancelBooking
} from "../../controllers/user/userBooking.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createBookingSchema } from "../../validators/booking.validator.js";
import {
    changeEmail,
    getProfile,
    updateProfile,
    verifyEmailChange,
} from "../../controllers/user/userProfile.controller.js";
import { getUserDashboard, getRestaurantDetails, getRestaurantMenu } from "../../controllers/user/userDashboardController.js";
import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";
import ROLES from "../../constants/roles.js";
import { getActiveBanners } from "../../controllers/userDashboardController.js";

import { addToWishlist, getWishlists, removeFromWishlist } from "../../controllers/user/userWishlist.controller.js";

const upload = multer({ storage });

const router = express.Router();

router.get("/dashboard", getUserDashboard);
router.get("/banners", getActiveBanners);
router.get("/restaurants/:id", getRestaurantDetails);
router.get("/restaurants/:id/menu", getRestaurantMenu);

// Protected routes
router.use(verifyRole(ROLES.USER));

router.post("/wishlist", addToWishlist);
router.get("/wishlist", getWishlists);
router.delete("/wishlist/:id", removeFromWishlist);
router.get("/profile", getProfile);

router.put("/profile", upload.single("avatar"), updateProfile);

router.patch("/profile/change-email/request", changeEmail);
router.patch("/profile/change-email/verify", verifyEmailChange);


router.post("/booking", validate(createBookingSchema), BookingRestaurant);
router.get("/bookings", getMyBookings);
router.patch("/bookings/:id/cancel", cancelBooking);

export default router;
