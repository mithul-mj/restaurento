import { loginAdminService } from "../../services/adminAuth.service.js";
import ROLES from "../../constants/roles.js";

export const loginAdmin = async (req, res, next) => {
  try {
    const { account, accessToken, refreshToken } = await loginAdminService(
      req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
