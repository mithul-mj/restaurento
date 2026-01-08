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
    phone: {
      type: String,
    },
    profilePictureUrl: {
      type: String,
    },
    walletBalance: {
      type: Number,
      default: 0,
      required: true,
    },
    location: {
      address: { type: String },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
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
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Apply the authentication plugin
userSchema.plugin(authPlugin, { role: "USER" });

export const User = mongoose.model("User", userSchema);
