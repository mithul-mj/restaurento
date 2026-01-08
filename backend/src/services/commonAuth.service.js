import bcrypt, { genSalt } from "bcryptjs";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.model.js";
import crypto from "crypto";
import redisClient from "../config/redis.js";
import transporter from "../config/nodeMailer.js";
import { ApiError } from "../utils/errors/ApiError.js";
import { getOtpEmailTemplate } from "../utils/emailTemplates.js";
import { env } from "../config/env.config.js";
import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Admin } from "../models/Admin.model.js";

export const checkExistingAccount = async (Model, email) => {
  const existingUserAccount = await User.findOne({ email });
  const existingRestaurentAccount = await Restaurant.findOne({ email });
  const existingAdminAccount = await Admin.findOne({ email });
  const existingAccount =
    existingUserAccount || existingRestaurentAccount || existingAdminAccount;

  if (existingAccount) {
    if (existingAccount.isEmailVerified) {
      throw new ApiError(409, "Account with this email already exists");
    }

    await sendVerificationOtp(email);

    throw new ApiError(403, "Account unverified. Verification code sent.");
  }
};

export const sendVerificationOtp = async (email) => {
  const otp = generateOtp();
  await storeOtp(email, otp);

  const subject = "Your Verification Code for Restaurento";
  const text = `Your OTP is ${otp}. It is valid for 2 minutes.`; // Fallback for old devices
  const html = getOtpEmailTemplate(otp, email);
  await sendEmail(email, subject, text, html);

  console.log(`OTP sent to ${email}: ${otp}`);
};

export const createAccount = async (Model, data) => {
  const newAccount = await Model.create(data);
  return newAccount;
};

export const loginAccount = async (Model, email, password, avatar, role) => {
  const account = await Model.findOne({ email });

  if (!account) {
    throw new ApiError(404, "Account does not exist");
  }
  if (role !== "ADMIN" && !account.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  const isPasswordValid = await account.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = account.generateAccessToken(role);
  const refreshToken = account.generateRefreshToken(role);

  // Save refresh token to DB - REMOVED per user request
  // await RefreshToken.create({
  //   token: refreshToken,
  //   user: account._id,
  //   onModel: role,
  // });

  return { account, accessToken, refreshToken };
};

const refreshToken = async (user) => {
  const newRefreshToken = await generateRefreshToken(user);
  await RefreshToken.create({
    token: newRefreshToken,
    user: user._id,
    onModel: user.role,
  });
};

export const revokeRefreshToken = async (tokenString) => {
  const result = await RefreshToken.deleteOne({ token: tokenString });

  if (result.deletedCount === 0) {
    throw new Error("Token not found or already revoked.");
  }
  return true;
};

export const generateOtp = (length = 6) => {
  const max = Math.pow(10, 6);
  const min = Math.pow(10, 5);
  return crypto.randomInt(min, max + 1).toString();
};

export const storeOtp = async (identifier, otp, ttlInSeconds = 120) => {
  const key = `otp:${identifier}`;
  await redisClient.setEx(key, ttlInSeconds + 20, otp);
};

export const verifyOtp = async (identifier, otp) => {
  const key = `otp:${identifier}`;
  const storedOtp = await redisClient.get(key);
  if (!storedOtp) {
    return false;
  }
  if (storedOtp === otp) {
    await redisClient.del(key);
    return true;
  }
  return false;
};

const sendEmail = async (to, subject, text, html) => {
  const info = await transporter.sendMail({
    from: env.SENDER_EMAIL,
    to,
    subject,
    text,
    html,
  });

  return info;
};

export const verifyAndRefreshToken = async (Model, token) => {
  if (!token) {
    throw new ApiError(401, "Refresh token required");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const account = await Model.findById(decoded._id);

    if (!account) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = account.generateAccessToken();
    const newRefreshToken = account.generateRefreshToken();

    return { account, accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};
