import { Admin } from "../models/Admin.model.js";
import { loginAccount } from "./commonAuth.service.js";

export const loginAdminService = async ({ email, password }) => {
  const result = await loginAccount(Admin, email, password, "ADMIN");
  return result;
};
