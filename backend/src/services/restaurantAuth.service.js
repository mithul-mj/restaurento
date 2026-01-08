import { Restaurant } from "../models/Restaurant.model.js";
import {
  checkExistingAccount,
  createAccount,
  loginAccount,
  sendVerificationOtp,
} from "./commonAuth.service.js";

export const registerRestaurantService = async ({
  fullName,
  email,
  password,
}) => {
  await checkExistingAccount(Restaurant, email);

  const newRestaurant = await createAccount(Restaurant, {
    fullName,
    email,
    password,
  });

  await sendVerificationOtp(email);

  return newRestaurant;
};

export const loginRestaurantService = async ({ email, password }) => {
  const result = await loginAccount(Restaurant, email, password, "RESTAURANT");
  return result;
};
