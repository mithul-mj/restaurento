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
  let signupBonus = 0;

  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      referrerId = referrer._id;
      signupBonus = REFERRAL_REWARD_NEW_USER; // Amount for the new user who joined via referral

      // 1. Update Referrer Balance
      referrer.walletBalance += REFERRAL_REWARD_REFERRER;
      await referrer.save();

      // 2. Create Transaction for Referrer
      await WalletTransaction.create({
        userId: referrer._id,
        amount: REFERRAL_REWARD_REFERRER,
        description: `Referral Bonus for inviting ${fullName}`
      });
    }
  }

  const newUser = await createAccount(User, {
    fullName,
    email,
    password,
    referredBy: referrerId,
    walletBalance: signupBonus
  });

  // 3. Create Transaction for New User only if they got a bonus
  if (signupBonus > 0) {
    await WalletTransaction.create({
      userId: newUser._id,
      amount: signupBonus,
      description: "Referral Signup Bonus"
    });
  }

  await sendVerificationOtp(email);

  return newUser;
};

export const loginUserService = async ({ email, password }) => {
  const result = await loginAccount(User, email, password, "USER");
  return result;
};


