import { env } from "../config/env.config.js";
import STATUS_CODES from "../constants/statusCodes.js";

// Unified helper to set cookies and send auth responses for all roles (User, Resto, Admin)
export const sendAuthResponse = (res, role, account, message, tokens = {}) => {
    const { accessToken, refreshToken } = tokens;
    const roleKey = role.toLowerCase();

    // 1. Set short-lived access cookie for session security
    res.cookie(`${roleKey}_accessToken`, accessToken, {
        httpOnly: true,
        secure: false, // Set to true for production with HTTPS
        sameSite: "lax",
        maxAge: env.ACCESS_TOKEN_MAX_AGE,
        path: "/",
    });

    // 2. Set long-lived refresh cookie, path-locked to the refresh endpoint for safety
    res.cookie(`${roleKey}_refreshToken`, refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: env.REFRESH_TOKEN_MAX_AGE,
        path: "/api/v1/auth/refresh-token",
    });

    // 3. Build a standard user object that handles role-specific field differences automatically
    const userPayload = {
        _id: account._id,
        fullName: account.fullName || account.name || account.restaurantName,
        email: account.email,
        role: role.toUpperCase(),
        avatar: account.avatar || (account.images && account.images.length > 0 ? account.images[0] : null),
        status: account.status,
        isOnboardingCompleted: account.isOnboardingCompleted,
        verificationStatus: account.verificationStatus,
    };

    return res.status(STATUS_CODES.OK).json({
        success: true,
        message,
        user: userPayload,
        role: role.toUpperCase(),
        accessToken, // Included if the client needs to store in state
        refreshToken,
    });
};

// Clear both cookies during logout - path must match exactly for the browser to delete them
export const clearAuthCookies = (res, role) => {
    const roleKey = role.toLowerCase();

    res.clearCookie(`${roleKey}_accessToken`, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
    });

    res.clearCookie(`${roleKey}_refreshToken`, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/api/v1/auth/refresh-token",
    });
};
