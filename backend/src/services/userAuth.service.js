import { User } from "../models/User.model.js";

import {
  checkExistingAccount,
  createAccount,
  loginAccount,
  sendVerificationOtp,

} from "./commonAuth.service.js";

export const registerUserService = async ({ fullName, email, password, referralCode }) => {
  await checkExistingAccount(User, email);

  let referrerId = null;
  let initialBalance = 5;

  if (referralCode) {
    const referrer = await User.findOne({ referralCode })
    referrerId = referrer._id;
    referrer.walletBalance += 10
    await referrer.save();
  }


  const newUser = await createAccount(User, {
    fullName,
    email,
    password,
    referredBy: referrerId,
    walletBalance: initialBalance
  });

  await sendVerificationOtp(email);

  return newUser;
};

export const loginUserService = async ({ email, password }) => {
  const result = await loginAccount(User, email, password, "USER");
  return result;
};


