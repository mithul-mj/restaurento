import {
  registerUserService,
  loginUserService,
  refreshUserTokenService,
} from "../../services/userAuth.service.js";
import ROLES from "../../constants/roles.js";
import { env } from "../../config/env.config.js";
import { OAuth2Client } from "google-auth-library";
import { User } from "../../models/User.model.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { createAccount } from "../../services/commonAuth.service.js";

export const registerUser = async (req, res, next) => {
  try {
    const newUser = await registerUserService(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
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
  const { token } = req.body;
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to verify Google token");
    }

    const payload = await response.json();

    const { email, name, picture } = payload;

    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: `Email already registered as RESTAURANT. Please login via restaurant portal.`,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await createAccount(User, {
        fullName: name,
        email,
        avatar: picture,
        isEmailVerified: true,
        password:
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8),
        role: ROLES.USER,
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.cookie("user_accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      maxAge: env.ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    res.cookie("user_refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      maxAge: env.REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: ROLES.USER,
        avatar: user.avatar,
      },
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
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    res.cookie("user_accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      maxAge: env.ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    res.cookie("user_refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      maxAge: env.REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: ROLES.USER,
        avatar: account.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    const { account, accessToken, refreshToken } =
      await refreshUserTokenService(incomingRefreshToken);

    res.cookie("user_accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      maxAge: env.ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    res.cookie("user_refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      maxAge: env.REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      accessToken,
      refreshToken,
      user: {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: ROLES.USER,
        avatar: account.avatar,
      },
      role: ROLES.USER,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("user_accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      path: "/",
    });
    res.clearCookie("user_refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      path: "/",
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    next(error);
  }
};


