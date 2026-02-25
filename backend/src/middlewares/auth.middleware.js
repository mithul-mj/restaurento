import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

import { env } from "../config/env.config.js";
import ROLES from "../constants/roles.js";
import STATUS_CODES from "../constants/statusCodes.js";


export const verifyRole = (role) => {
  return async (req, res, next) => {
    let token;
    let cookieName;

    if (role === ROLES.ADMIN) { token = req.cookies.admin_accessToken; cookieName = "admin_accessToken"; }
    else if (role === ROLES.RESTAURANT) { token = req.cookies.restaurant_accessToken; cookieName = "restaurant_accessToken"; }
    else { token = req.cookies.user_accessToken; cookieName = "user_accessToken"; }

    if (!token) {
      console.log(`[Auth Middleware] ${STATUS_CODES.UNAUTHORIZED}: Token missing. Role: ${role}, Expected Cookie: ${cookieName}, Cookies Present:`, Object.keys(req.cookies));
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: `Not authorized: ${cookieName} missing` });
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      req.user = decoded;

      // Check redis only if connected
      if (redisClient.isReady) {
        const isBlacklisted = await redisClient.get(`blacklist:${role}:${decoded._id}`);
        if (isBlacklisted) {
          await redisClient.del(`blacklist:${role}:${decoded._id}`);

          const cookieOptions = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
          };

          if (role === ROLES.ADMIN) res.clearCookie("admin_accessToken", cookieOptions);
          else if (role === ROLES.RESTAURANT) res.clearCookie("restaurant_accessToken", cookieOptions);
          else res.clearCookie("user_accessToken", cookieOptions);

          return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "User is suspended. Please contact support." });
        }
      }

      next();
    } catch (error) {
      console.error(`[Auth Middleware] Token verification failed:`, error.message);
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: `Token verification failed: ${error.message}` });
    }
  };
}

