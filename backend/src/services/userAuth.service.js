import { User } from "../models/User.model.js";
import { WalletTransaction } from "../models/WalletTransaction.model.js";
import {
  checkExistingAccount,
  createAccount,
  loginAccount,
  sendVerificationOtp,
} from "./commonAuth.service.js";
import { REFERRAL_REWARD_REFERRER, REFERRAL_REWARD_NEW_USER } from "../constants/constants.js";

export const registerUserService = async ({ fullName, email, password, referralCode }) => {
  await checkExistingAccount(User, email);

  let referrerId = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      referrerId = referrer._id;
    }
  }

  const newUser = await createAccount(User, {
    fullName,
    email,
    password,
    referredBy: referrerId,
  });

  await sendVerificationOtp(email);

  return newUser;
};

export const loginUserService = async ({ email, password }) => {
  const result = await loginAccount(User, email, password, "USER");
  return result;
};


