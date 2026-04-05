import mongoose, { Schema } from "mongoose";
import { authPlugin } from "./plugins/auth.plugin.js";

const menuSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  categories: [{ type: String }], // Array: ["Breakfast", "Lunch", "Dinner"]
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
});

const dayHoursSchema = new Schema(
  {
    // No dayName - index determines day (0=Monday, 1=Tuesday, etc.)
    startTime: { type: Number },
    endTime: { type: Number },
    isClosed: { type: Boolean, default: false },
    generatedSlots: [
      {
        startTime: { type: Number },
        endTime: { type: Number },
      },
    ],
  },
  { _id: false },
);

const restaurantSchema = new Schema(
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
      maxlength: [60, "Business email must be under 60 characters"]
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },

    // Onboarding Step 1: Basic Info & Hours
    restaurantName: {
      type: String,
      trim: true,
    },
    restaurantPhone: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    tags: [{ type: String }], // Cuisine tags: ["Italian", "Fast Food", etc.]

    // Onboarding Step 2: Seating & Location
    images: [{ type: String }],
    address: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },

    // Onboarding Step 3: Legal Documents
    documents: {
      restaurantLicense: { type: String }, // File path/URL
      businessCert: { type: String },
      fssaiCert: { type: String },
      ownerIdCert: { type: String },
    },

    // Onboarding Step 4: Menu & Pricing
    menuItems: [menuSchema],

    // System fields
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["new", "pending", "approved", "rejected", "banned"],
      default: "new",
      required: true,
    },
    submissionAttempts: {
      type: Number,
      default: 0,
    },
    verificationHistory: [
      {
        status: { type: String },
        reason: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    refreshToken: {
      type: String,
    },
    isOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    submissionAttempts: {
      type: Number,
      default: 0,
    },
    verificationHistory: [
      {
        status: {
          type: String,
          enum: ["new", "pending", "approved", "rejected", "banned"],
        },
        reason: { type: String }, // For rejections
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Apply the authentication plugin with role "RESTAURANT"
restaurantSchema.plugin(authPlugin, { role: "RESTAURANT" });

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
