import { loginAdminService } from "../../services/adminAuth.service.js";
import ROLES from "../../constants/roles.js";
import { env } from "../../config/env.config.js";

export const loginAdmin = async (req, res, next) => {
  try {
    const { account, accessToken, refreshToken } = await loginAdminService(
      req.body);

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
