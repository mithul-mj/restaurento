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
  sendEmail,
} from "../services/commonAuth.service.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";

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
    const Model = getModelByRole(role);
    const account = await Model.findOne({ email });

    if (!account) throw new ApiError(404, "Account not found");

    const secret = env.JWT_FORGOT_PASSWORD_SECRET + account.password;
    const token = jwt.sign({ id: account._id, role: account.role }, secret, {
      expiresIn: env.JWT_FORGOT_PASSWORD_TOKEN_EXPIRE,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${account._id}&role=${role}`;

    const subject = "Reset Your Password";
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`;

    await sendEmail(email, subject, "Reset your password", html);

    res.status(200).json({ message: "Reset link sent to your email" });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordWithLink = async (req, res, next) => {
  try {
    const { id, token, role, newPassword } = req.body;
    const Model = getModelByRole(role);
    const account = await Model.findById(id);

    if (!account) throw new ApiError(404, "Account not found");

    const secret = env.JWT_FORGOT_PASSWORD_SECRET + account.password;
    try {
      jwt.verify(token, secret);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired reset link");
    }

    account.password = newPassword;
    await account.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is missing");
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, env.JWT_REFRESH_SECRET);
      console.log("[Refresh] Decoded Token:", decoded);
    } catch (err) {
      console.error("[Refresh] Token verification failed:", err.message);
      throw new ApiError(401, "Invalid refresh token");
    }

    let account = null;
    let role = decoded.role;
    console.log("[Refresh] Detected Role:", role);

    if (role) {
      const Model = getModelByRole(role);
      if (Model) {
        account = await Model.findById(decoded._id);
        console.log("[Refresh] Account found by role:", !!account);
      }
    }

    if (!account) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const Model = getModelByRole(role);

    const { accessToken, refreshToken } = await verifyAndRefreshToken(
      Model,
      incomingRefreshToken
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: env.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: env.REFRESH_TOKEN_MAX_AGE,
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
