import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Admin } from "../models/Admin.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import { ApiError } from "../utils/errors/ApiError.js";
import {
  verifyOtp,
  generateOtp,
  storeOtp,
  verifyAndRefreshToken,
  sendVerificationOtp,
} from "../services/commonAuth.service.js";

const getModelByRole = (role) => {
  if (!role) return null;
  const normalizedRole = role.toUpperCase();
  if (normalizedRole === "USER") return User;
  if (normalizedRole === "RESTAURANT") return Restaurant;
  if (normalizedRole === "ADMIN") return Admin;
  return null;
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and Role are required" });
    }

    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const isValid = await verifyOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const account = await Model.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.isEmailVerified = true;
    await account.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    sendVerificationOtp(email);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and Role are required" });
    }

    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const account = await Model.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const otp = generateOtp(6);
    await storeOtp(email, otp, 120);

    console.log(`[Forgot Password] OTP for ${email} (${role}): ${otp}`);

    // await sendEmail(email, "Reset Password OTP", `Your OTP is ${otp}`);

    res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, role, newPassword } = req.body;

    if (!email || !otp || !role || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const isValid = await verifyOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const account = await Model.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.password = newPassword;
    account.isEmailVerified = true;
    await account.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";

export const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is missing");
    }

    // 1. Decode token to find role
    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, env.JWT_SECRET);
      console.log("[Refresh] Decoded Token:", decoded);
    } catch (err) {
      console.error("[Refresh] Token verification failed:", err.message);
      throw new ApiError(401, "Invalid refresh token");
    }

    // Attempt to identify user role
    let account = null;
    let role = decoded.role; // Helper: Try to get role from token first
    console.log("[Refresh] Detected Role:", role);

    if (role) {
      const Model = getModelByRole(role);
      if (Model) {
        account = await Model.findById(decoded._id);
        console.log("[Refresh] Account found by role:", !!account);
      }
    }

    // Fallback: Check all collections if role is missing or invalid
    if (!account) {
      // Try User
      account = await User.findById(decoded._id);
      if (account) role = "USER";

      // Try Restaurant
      if (!account) {
        account = await Restaurant.findById(decoded._id);
        if (account) role = "RESTAURANT";
      }

      // Try Admin
      if (!account) {
        account = await Admin.findById(decoded._id);
        if (account) role = "ADMIN";
      }
    }

    if (!account) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // 2. Get the correct model
    const Model = getModelByRole(role);

    // 3. Verify and refresh (using the generic service, but now passing Model)
    const { accessToken, refreshToken } = await verifyAndRefreshToken(
      Model,
      incomingRefreshToken
    );

    // 4. Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 Min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      accessToken,
      refreshToken,
      user: {
        _id: account._id,
        fullName: account.fullName || account.name,
        email: account.email,
        role: role,
      },
      role: role,
    });
  } catch (error) {
    next(error);
  }
};
