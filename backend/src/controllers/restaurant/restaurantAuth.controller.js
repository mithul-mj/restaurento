import crypto from "crypto";
import {
  registerRestaurantService,
  loginRestaurantService,
} from "../../services/restaurantAuth.service.js";
import ROLES from "../../constants/roles.js";
import { User } from "../../models/User.model.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { createAccount } from "../../services/commonAuth.service.js";
import { env } from "../../config/env.config.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { sendAuthResponse, clearAuthCookies } from "../../utils/auth.util.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages.js";


export const registerRestaurant = async (req, res, next) => {
  try {
    const newRestaurant = await registerRestaurantService(req.body);

    return res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.REGISTERED,
      restaurant: {
        _id: newRestaurant._id,
        name: newRestaurant.fullName,
        email: newRestaurant.email,
        role: ROLES.RESTAURANT,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginRestaurant = async (req, res, next) => {
  try {
    const { account, accessToken, refreshToken } = await loginRestaurantService(
      req.body
    );

    return sendAuthResponse(res, ROLES.RESTAURANT, account, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuthRestaurant = async (req, res, next) => {
  const { token } = req.body;
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.VERIFICATION_FAILED);
    }

    const payload = await response.json();

    const { email, name } = payload;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      });
    }

    let restaurant = await Restaurant.findOne({ email });

    if (!restaurant) {
      restaurant = await createAccount(Restaurant, {
        fullName: name,
        email,
        isEmailVerified: true,
        password: crypto.randomBytes(16).toString("hex"),
        role: ROLES.RESTAURANT,
      });
    }

    const accessToken = restaurant.generateAccessToken();
    const refreshToken = restaurant.generateRefreshToken();

    return sendAuthResponse(res, ROLES.RESTAURANT, restaurant, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Google Auth Restaurant Error:", error);
    next(error);
  }
};


export const logout = async (req, res, next) => {
  try {
    clearAuthCookies(res, "RESTAURANT");
    return res.status(STATUS_CODES.OK).json({ success: true, message: SUCCESS_MESSAGES.LOGGED_OUT });
  } catch (error) {
    next(error);
  }
};
