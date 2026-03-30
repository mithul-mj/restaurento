import express from "express";
import {
    BookingRestaurant,
    cancelBooking,
    checkBookingAvailability,
    retryBookingPayment
} from "../../controllers/user/userBooking.controller.js";
import {
    getMyBookings,
    getBookingDetails
} from "../../controllers/user/userBookingHistory.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createBookingSchema } from "../../validators/booking.validator.js";
import {
    changeEmail,
    getMyWalletHistory,
    getProfile,
    getWalletBalance,
    updateProfile,
    verifyEmailChange,
} from "../../controllers/user/userProfile.controller.js";
import { getUserDashboard, getRestaurantDetails, getRestaurantMenu, getTopRestaurants } from "../../controllers/user/userDashboardController.js";
import { getAvailableCoupons } from "../../controllers/userCoupon.controller.js";
import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";
import ROLES from "../../constants/roles.js";
import { getActiveBanners } from "../../controllers/userDashboardController.js";

import { addToWishlist, getWishlists, removeFromWishlist } from "../../controllers/user/userWishlist.controller.js";
import { getNotifications, getUnreadCount, markAllAsRead, markOneAsRead } from "../../controllers/user/notification.controller.js";


const upload = multer({ storage });

const router = express.Router();

router.get("/dashboard", getUserDashboard);
router.get("/top-restaurants", getTopRestaurants);
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
router.post("/bookings/:bookingId/retry", retryBookingPayment);
router.get("/bookings", getMyBookings);
router.get("/bookings/:id", getBookingDetails);
router.get("/bookings/:id/check-availability", checkBookingAvailability);
router.patch("/bookings/:id/cancel", cancelBooking);
router.get('/wallet/balance', getWalletBalance)
router.get('/wallet', getMyWalletHistory)

router.get("/coupons", getAvailableCoupons);

router.get("/notifications", getNotifications);
router.get("/notifications/unread-count", getUnreadCount);
router.patch("/notifications/mark-all-read", markAllAsRead);
router.patch("/notifications/:id/mark-read", markOneAsRead);


export default router;


