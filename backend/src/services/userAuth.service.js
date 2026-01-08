import { User } from "../models/User.model.js";

import {
  checkExistingAccount,
  createAccount,
  loginAccount,
  sendVerificationOtp,
  verifyAndRefreshToken,
} from "./commonAuth.service.js";

export const registerUserService = async ({ fullName, email, password }) => {
  await checkExistingAccount(User, email);
  const newUser = await createAccount(User, {
    fullName,
    email,
    password,
  });

  await sendVerificationOtp(email);

  return newUser;
};

export const loginUserService = async ({ email, password }) => {
  const result = await loginAccount(User, email, password, "USER");
  return result;
};

export const refreshUserTokenService = async (token) => {
  return await verifyAndRefreshToken(User, token);
};
