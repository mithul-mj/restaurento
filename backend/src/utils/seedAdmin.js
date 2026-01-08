import { Admin } from "../models/Admin.model.js";
import { env } from "../config/env.config.js";

export const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({
      email: env.DEFAULT_ADMIN_EMAIL,
    });
    if (existingAdmin) {
      console.log("admin account aldready exists");
      return;
    }
    const newAdmin = new Admin({
      email: env.DEFAULT_ADMIN_EMAIL,
      password: env.DEFAULT_ADMIN_PASSWORD,
      
    });
    await newAdmin.save();
    console.log("admin created succesfully");
  } catch (error) {
    console.log("error occured during seeding admin");
  }
};
