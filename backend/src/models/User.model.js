import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
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
      maxlength: [30, "Email must be under 30 characters"]
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
    isReferralRewardClaimed: {
      type: Boolean,
      default: false,
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
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.plugin(authPlugin, { role: "USER" });

userSchema.pre("save", async function () {
  if (!this.referralCode) {
    const namePart = this.fullName.replace(/\s+/g, '').slice(0, 4).toUpperCase();
    const hashPart = crypto
      .createHash("sha256")
      .update(this._id.toString())
      .digest("hex")
      .slice(0, 6)
      .toUpperCase();

    this.referralCode = `${namePart}${hashPart}`;
  }
});

export const User = mongoose.model("User", userSchema);
