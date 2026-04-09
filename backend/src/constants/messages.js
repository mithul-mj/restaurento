export const ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: "Internal Server Error",
    VALIDATION_FAILED: "Input validation failed",
    INVALID_FILE_TYPE: "Invalid file type. Only JPG, PNG, WEBP, and AVIF images are allowed.",
    FILE_TOO_LARGE: "File is too large. Max limit is 10MB.",
    UNAUTHORIZED: "Unauthorized access",
    NOT_FOUND: "Resource not found",
    
    // Auth & Accounts
    INVALID_ROLE: "Invalid role",
    ACCOUNT_NOT_FOUND: "Account not found",
    ACCOUNT_SUSPENDED: "Your account has been suspended. Please contact support.",
    OTP_EXPIRED: "Invalid or expired OTP",
    AUTH_REQUIRED: "Email, OTP, and Role are required",
    EMAIL_REQUIRED: "Email is required",

    // Restaurant & Onboarding
    RESTAURANT_NOT_FOUND: "Restaurant not found",
    ONBOARDING_PENDING: "Application is under review. You cannot edit details while pending approval.",
    BANNER_REQUIRED: "Banner image is required",
    BANNER_NOT_FOUND: "Banner not found",
    OFFER_NOT_FOUND: "Offer not found",
    EXPIRED_OFFER: "Expired offers cannot be activated or deactivated.",
    COUPON_NOT_FOUND: "Coupon not found",
    COUPON_EXISTS: "Coupon code already exists",

    // Payments & Bookings
    BOOKING_NOT_FOUND: "Booking not found or session expired.",
    ALREADY_PROCESSED: "Booking is already processed.",
    INSUFFICIENT_BALANCE: "Insufficient wallet balance. Payment credited to wallet.",
    SEATS_NOT_AVAILABLE: "Seats are no longer available. Refunded to wallet.",
    INVALID_SIGNATURE: "Invalid Signature",
    TRANSACTION_NOT_FOUND: "Transaction not found",
    INVALID_RESET_LINK: "Invalid or expired reset link",
    REFRESH_TOKEN_MISSING: "Refresh token is missing",
    DISH_UNAVAILABLE: "Some dishes are no longer available. Refunded to wallet.",
    VERIFICATION_FAILED: "Verification failed",

    // User & Profile
    USER_NOT_FOUND: "User not found",
    EMAIL_ALREADY_EXISTS: "Email already exists in our system",
    WISHLIST_NOT_FOUND: "Wishlist item not found",
    REVIEW_CHECKIN_REQUIRED: "You can only review restaurants you've visited (checked-in required).",

    // Restaurant & Menu
    RESTAURANT_CLOSED: "Restaurant is temporarily closed",
    MENU_ITEM_NOT_FOUND: "Menu item not found or already deleted",
    MAX_SUBMISSION_ATTEMPTS: "Maximum submission attempts (3) reached. Please contact support.",
    
    // QR & Check-in
    QR_INVALID: "Invalid or expired QR code",
    QR_MISSING: "No token found",
    ALREADY_CHECKED_IN: "Guest is already checked-in",
    BOOKING_CANCELLED: "This booking has been canceled",
    UNAUTHORIZED_RESTAURANT: "Unauthorized: this booking belongs to another restaurant",

    // General Resource Errors
    VALIDATION_FAILED: "Verification failed. Please try again.",
    PAST_DATE: "Cannot book for a past date.",
    BUFFER_TIME_REQUIRED: "Slot too soon. A minimum buffer time is required.",
    RESTAURANT_CLOSED_DAY: "Restaurant is closed on the selected day.",
    INVALID_SLOT: "The selected time slot is invalid.",
    CATEGORY_MISMATCH: "Some items in your cart are not available for this time slot.",
};

export const SUCCESS_MESSAGES = {
    // Auth
    LOGGED_OUT: "Logged out",
    OTP_SENT: "OTP sent successfully",
    EMAIL_VERIFIED: "Email verified successfully",
    PASSWORD_UPDATED: "Password updated successfully",
    RESET_LINK_SENT: "Reset link sent to your email",
    REGISTERED: "Registered successfully",
    TOKEN_REFRESHED: "Access token refreshed",
    LOGIN_SUCCESS: "Logged in successfully",

    // User Profile & Wishlist
    PROFILE_UPDATED: "Profile updated successfully",
    EMAIL_UPDATED: "Email updated successfully",
    WISHLIST_SAVED: "Saved to wishlist",
    WISHLIST_REMOVED: "Removed from wishlist",

    // Restaurant & Onboarding
    ONBOARDING_COMPLETED: "Onboarding details submitted successfully",
    RESTAURANT_REGISTERED: "Restaurant registered successfully",
    MENU_ITEM_ADDED: "Menu item added successfully",
    MENU_ITEM_UPDATED: "Menu item updated successfully",
    CHECKIN_SUCCESS: "Check-in successful!",
    
    // Notifications
    NOTIFICATION_READ: "Notification marked as read",
    ALL_READ: "All marked as read",
    
    // CRUD Operations (Generic)
    CREATED: (resource) => `${resource} created successfully`,
    UPDATED: (resource) => `${resource} updated successfully`,
    DELETED: (resource) => `${resource} deleted successfully`,
    ACTIVATED: (resource) => `${resource} activated successfully`,
    DEACTIVATED: (resource) => `${resource} deactivated successfully`,

    // Specifics
    BANNER_CREATED: "Banner created successfully",
    BANNER_UPDATED: "Banner updated successfully",
    BANNER_DELETED: "Banner deleted successfully",
    BANNER_ACTIVATED: "Banner activated successfully",
    BANNER_DEACTIVATED: "Banner deactivated successfully",
    
    COUPON_CREATED: "Coupon created successfully",
    COUPON_UPDATED: "Coupon updated successfully",
    COUPON_DELETED: "Coupon deleted successfully",

    OFFER_CREATED: "Offer created successfully",
    OFFER_UPDATED: "Offer updated successfully",
    OFFER_DELETED: "Offer deleted successfully",

    // Payments & Bookings
    PAYMENT_SUCCESS: "Payment successful!",
    BOOKING_INITIATED: "Booking initiated successfully.",
    BOOKING_SUCCESS: "Booking successful.",
    BOOKING_CANCELED: "Booking canceled successfully.",
};
