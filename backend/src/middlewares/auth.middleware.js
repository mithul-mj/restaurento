import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

import { env } from "../config/env.config.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = decoded;
    const isBlacklisted = await redisClient.get(
      `blacklist:user:${decoded._id}`
    );
    if (isBlacklisted) {
      await redisClient.del(`blacklist:user:${decoded._id}`);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res
        .status(401)
        .json({ message: "User is suspended. Please contact support." });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

export const verifyJWT = protect;
