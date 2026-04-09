import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Admin } from "../models/Admin.model.js";

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
import STATUS_CODES from "../constants/statusCodes.js";
import { sendAuthResponse } from "../utils/auth.util.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages.js";


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
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: ERROR_MESSAGES.AUTH_REQUIRED });
    }

    const Model = getModelByRole(role);
    if (!Model) return res.status(STATUS_CODES.BAD_REQUEST).json({ message: ERROR_MESSAGES.INVALID_ROLE });

    const isValid = await verifyOtp(email, otp);
    if (!isValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: ERROR_MESSAGES.OTP_EXPIRED });
    }

    const account = await Model.findOne({ email });
    if (!account) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND });
    }

    account.isEmailVerified = true;
    await account.save();

    res.status(STATUS_CODES.OK).json({ message: SUCCESS_MESSAGES.EMAIL_VERIFIED });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: ERROR_MESSAGES.EMAIL_REQUIRED });
    }
    sendVerificationOtp(email);
    return res.status(STATUS_CODES.OK).json({ message: SUCCESS_MESSAGES.OTP_SENT });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const Model = getModelByRole(role);
    const account = await Model.findOne({ email });

    if (!account) throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.ACCOUNT_NOT_FOUND);

    const secret = env.JWT_FORGOT_PASSWORD_SECRET + account.password;
    const token = jwt.sign({ id: account._id, role: account.role }, secret, {
      expiresIn: env.JWT_FORGOT_PASSWORD_TOKEN_EXPIRE,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${account._id}&role=${role}`;

    const subject = "Reset Your Password";
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`;

    await sendEmail(email, subject, "Reset your password", html);

    res.status(STATUS_CODES.OK).json({ message: SUCCESS_MESSAGES.RESET_LINK_SENT });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordWithLink = async (req, res, next) => {
  try {
    const { id, token, role, newPassword } = req.body;
    const Model = getModelByRole(role);
    const account = await Model.findById(id);

    if (!account) throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.ACCOUNT_NOT_FOUND);

    const secret = env.JWT_FORGOT_PASSWORD_SECRET + account.password;
    try {
      jwt.verify(token, secret);
    } catch (err) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, ERROR_MESSAGES.INVALID_RESET_LINK);
    }

    account.password = newPassword;
    await account.save();

    res.status(STATUS_CODES.OK).json({ message: SUCCESS_MESSAGES.PASSWORD_UPDATED });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    let incomingRefreshToken;
    let role = req.body.role || req.query.role;

    if (role) {
      if (role === 'ADMIN') incomingRefreshToken = req.cookies.admin_refreshToken;
      else if (role === 'RESTAURANT') incomingRefreshToken = req.cookies.restaurant_refreshToken;
      else incomingRefreshToken = req.cookies.user_refreshToken;
    }
    else {
      if (req.cookies.admin_refreshToken) { incomingRefreshToken = req.cookies.admin_refreshToken; role = 'ADMIN'; }
      else if (req.cookies.restaurant_refreshToken) { incomingRefreshToken = req.cookies.restaurant_refreshToken; role = 'RESTAURANT'; }
      else if (req.cookies.user_refreshToken) { incomingRefreshToken = req.cookies.user_refreshToken; role = 'USER'; }
    }

    if (!incomingRefreshToken) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, ERROR_MESSAGES.REFRESH_TOKEN_MISSING);
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    if (role && decoded.role !== role) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, ERROR_MESSAGES.ROLE_MISMATCH);
    }
    role = decoded.role;

    const Model = getModelByRole(role);
    if (!Model) throw new ApiError(STATUS_CODES.BAD_REQUEST, ERROR_MESSAGES.INVALID_ROLE);

    const { account, accessToken, refreshToken } = await verifyAndRefreshToken(
      Model,
      incomingRefreshToken
    );
    
    return sendAuthResponse(res, role, account, SUCCESS_MESSAGES.TOKEN_REFRESHED, {
        accessToken,
        refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
