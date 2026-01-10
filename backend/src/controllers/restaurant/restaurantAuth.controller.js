import {
  registerRestaurantService,
  loginRestaurantService,
} from "../../services/restaurantAuth.service.js";
import ROLES from "../../constants/roles.js";
import { User } from "../../models/User.model.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { createAccount } from "../../services/commonAuth.service.js";
import { env } from "../../config/env.config.js";

export const registerRestaurant = async (req, res, next) => {
  try {
    const newRestaurant = await registerRestaurantService(req.body);

    return res.status(201).json({
      success: true,
      message: "Restaurant registered successfully",
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

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
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
      message: "Restaurant logged in successfully",
      restaurant: {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: ROLES.RESTAURANT,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
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
      throw new Error("Failed to verify Google token");
    }

    const payload = await response.json();

    const { email, name } = payload;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `Email already registered as USER. Please login via user portal.`,
      });
    }

    let restaurant = await Restaurant.findOne({ email });

    if (!restaurant) {
      restaurant = await createAccount(Restaurant, {
        fullName: name,
        email,
        isEmailVerified: true,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
        role: ROLES.RESTAURANT,
        status: 'pending'
      });
    }

    const accessToken = restaurant.generateAccessToken();
    const refreshToken = restaurant.generateRefreshToken();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
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
      message: "Restaurant logged in successfully",
      restaurant: {
        _id: restaurant._id,
        fullName: restaurant.fullName,
        email: restaurant.email,
        role: ROLES.RESTAURANT,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Google Auth Restaurant Error:", error);
    next(error);
  }
};
