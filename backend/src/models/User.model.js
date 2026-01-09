import mongoose, { Schema } from "mongoose";
import { authPlugin } from "./plugins/auth.plugin.js";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
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
    walletBalance: {
      type: Number,
      default: 0,
      required: true,
    },
    location: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
      address: {
        type: String,
        default: null,
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true }
);

// Apply the authentication plugin
userSchema.plugin(authPlugin, { role: "USER" });

export const User = mongoose.model("User", userSchema);
