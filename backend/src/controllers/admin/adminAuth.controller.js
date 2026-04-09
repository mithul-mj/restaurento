import { loginAdminService } from "../../services/adminAuth.service.js";
import ROLES from "../../constants/roles.js";
import { env } from "../../config/env.config.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { sendAuthResponse, clearAuthCookies } from "../../utils/auth.util.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages.js";


export const loginAdmin = async (req, res, next) => {
  try {
    const { account, accessToken, refreshToken } = await loginAdminService(
      req.body);

    return sendAuthResponse(res, ROLES.ADMIN, account, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
        accessToken,
        refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookies(res, "ADMIN");
    return res.status(STATUS_CODES.OK).json({ success: true, message: SUCCESS_MESSAGES.LOGGED_OUT });
  } catch (error) {
    next(error);
  }
};

