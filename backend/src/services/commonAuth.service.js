import bcrypt, { genSalt } from "bcryptjs";
import jwt from "jsonwebtoken";

import crypto from "crypto";
import redisClient from "../config/redis.js";
import transporter from "../config/nodeMailer.js";
import { ApiError } from "../utils/errors/ApiError.js";
import { getOtpEmailTemplate } from "../utils/emailTemplates.js";
import { env } from "../config/env.config.js";
import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Admin } from "../models/Admin.model.js";
import STATUS_CODES from "../constants/statusCodes.js";
import { WalletTransaction } from "../models/WalletTransaction.model.js";
import { REFERRAL_REWARD_REFERRER, REFERRAL_REWARD_NEW_USER } from "../constants/constants.js";


export const checkExistingAccount = async (Model, email) => {
  const existingUserAccount = await User.findOne({ email });
  const existingRestaurentAccount = await Restaurant.findOne({ email });
  const existingAdminAccount = await Admin.findOne({ email });
  const existingAccount =
    existingUserAccount || existingRestaurentAccount || existingAdminAccount;

  if (existingAccount) {
    if (existingAccount.isEmailVerified) {
      throw new ApiError(STATUS_CODES.CONFLICT, "Account with this email already exists");
    }

    await sendVerificationOtp(email);

    throw new ApiError(STATUS_CODES.FORBIDDEN, "Account unverified. Verification code sent.");
  }
};

export const sendVerificationOtp = async (email) => {
  const otp = generateOtp();
  await storeOtp(email, otp);

  const subject = "Your Verification Code for Restaurento";
  const text = `Your OTP is ${otp}. It is valid for 2 minutes.`;
  const html = getOtpEmailTemplate(otp, email);
  await sendEmail(email, subject, text, html);

  console.log(`OTP sent to ${email}: ${otp}`);
};

export const createAccount = async (Model, data) => {
  const newAccount = await Model.create(data);
  return newAccount;
};

export const loginAccount = async (Model, email, password, role) => {
  // Security Layer: Reject inputs that exceed architectural specifications (Max 30)
  if (email?.length > 30 || password?.length > 30) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid input: Credentials exceed character limits");
  }

  const account = await Model.findOne({ email });

  if (!account) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Account does not exist");
  }
  if (role !== "ADMIN" && !account.isEmailVerified) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, "Please verify your email before logging in");
  }

  if (account.status === "suspended") {
    throw new ApiError(STATUS_CODES.FORBIDDEN, "Your account has been suspended. Please contact support.");
  }

  const isPasswordValid = await account.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Invalid credentials");
  }

  const accessToken = account.generateAccessToken(role);
  const refreshToken = account.generateRefreshToken(role);

  return { account, accessToken, refreshToken };
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

export const sendEmail = async (to, subject, text, html) => {
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
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Refresh token required");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const account = await Model.findById(decoded._id);

    if (!account) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Invalid refresh token");
    }

    if (account.status === "suspended") {
      throw new ApiError(STATUS_CODES.FORBIDDEN, "Your account has been suspended. Please contact support.");
    }

    const accessToken = account.generateAccessToken();
    const newRefreshToken = account.generateRefreshToken();

    return { account, accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Invalid or expired refresh token");
  }
};


export const processReferralReward = async (userId, session) => {

  const user = await User.findById(userId).session(session);
  if (!user || !user.referredBy || user.isReferralRewardClaimed) return;

  const referrer = await User.findById(user.referredBy).session(session);
  if (referrer) {
    // 1. Award Referrer
    referrer.walletBalance += REFERRAL_REWARD_REFERRER;
    await referrer.save({ session });
    await WalletTransaction.create([{
      userId: referrer._id,
      amount: REFERRAL_REWARD_REFERRER,
      description: `Referral bonus for first purchase by ${user.fullName}`
    }], { session });

    // 2. Award Referred User
    user.walletBalance += REFERRAL_REWARD_NEW_USER;
    user.isReferralRewardClaimed = true;
    await user.save({ session });
    await WalletTransaction.create([{
      userId: user._id,
      amount: REFERRAL_REWARD_NEW_USER,
      description: "Referral welcome bonus (Applied on first purchase)"
    }], { session });

    console.log(`Referral rewards processed for User: ${user._id} and Referrer: ${referrer._id}`);
  }
};
