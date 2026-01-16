import { loginAdminService } from "../../services/adminAuth.service.js";
import ROLES from "../../constants/roles.js";
import { env } from "../../config/env.config.js";

export const loginAdmin = async (req, res, next) => {
  try {
    const { account, accessToken, refreshToken } = await loginAdminService(
      req.body);

    res.cookie("admin_accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: env.ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    res.cookie("admin_refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: env.REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      admin: {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: ROLES.ADMIN,
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

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("admin_accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Protects against CSRF
      path: "/",
    });
    res.clearCookie("admin_refreshToken", {
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
