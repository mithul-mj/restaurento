import crypto from "crypto";
import {
  registerUserService,
  loginUserService,

} from "../../services/userAuth.service.js";
import ROLES from "../../constants/roles.js";
import { env } from "../../config/env.config.js";
import { OAuth2Client } from "google-auth-library";
import { User } from "../../models/User.model.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { createAccount } from "../../services/commonAuth.service.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { WalletTransaction } from "../../models/WalletTransaction.model.js";
import { REFERRAL_REWARD_REFERRER, REFERRAL_REWARD_NEW_USER } from "../../constants/constants.js";
import { sendAuthResponse, clearAuthCookies } from "../../utils/auth.util.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages.js";


export const registerUser = async (req, res, next) => {
  try {
    const newUser = await registerUserService(req.body);

    return res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.REGISTERED,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: ROLES.USER,
      },
    });
  } catch (error) {
    next(error);
  }
};

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleAuthUser = async (req, res, next) => {
  const { token, referralCode } = req.body;
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.VERIFICATION_FAILED);
    }

    const payload = await response.json();

    const { email, name, picture } = payload;

    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      let referrerId = null;
      let signupBonus = 0;

      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referrerId = referrer._id;
        }
      }

      user = await createAccount(User, {
        fullName: name,
        email,
        avatar: picture,
        isEmailVerified: true,
        password: crypto.randomBytes(16).toString("hex"),
        role: ROLES.USER,
        referredBy: referrerId,
        walletBalance: 0,
      });

      // 3. Create Transaction for New User only if they got a bonus
      if (signupBonus > 0) {
        await WalletTransaction.create({
          userId: user._id,
          amount: signupBonus,
          description: "Referral Signup Bonus"
        });
      }
    } else if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save();
    }

    if (user.status === "suspended") {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_SUSPENDED,
      });
    }

    const accessToken = user.generateAccessToken(ROLES.USER);
    const refreshToken = user.generateRefreshToken(ROLES.USER);

    return sendAuthResponse(res, ROLES.USER, user, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
        accessToken,
        refreshToken
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { account, accessToken, refreshToken } = await loginUserService(
      req.body
    );

    if (account.status === "suspended") {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_SUSPENDED,
      });
    }

    return sendAuthResponse(res, ROLES.USER, account, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
        accessToken,
        refreshToken
    });
  } catch (error) {
    next(error);
  }
};



export const logout = async (req, res, next) => {
  try {
    clearAuthCookies(res, "USER");
    return res.status(STATUS_CODES.OK).json({ success: true, message: SUCCESS_MESSAGES.LOGGED_OUT });
  } catch (error) {
    next(error);
  }
};


