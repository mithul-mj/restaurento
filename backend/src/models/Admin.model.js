import mongoose, { Schema } from "mongoose";
import { authPlugin } from "./plugins/auth.plugin.js";
const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

adminSchema.plugin(authPlugin, { role: "ADMIN" });
export const Admin = mongoose.model("Admin", adminSchema);
