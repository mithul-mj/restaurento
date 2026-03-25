import mongoose, { Schema } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [15, "Coupon code cannot exceed 15 characters"]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    discountValue: {
      type: Number,
      required: true, // Represents the percentage
      min: [1, "Discount percentage must be at least 1%"],
      max: [100, "Discount percentage cannot exceed 100%"]
    },
    maxDiscountCap: {
      type: Number,
      required: [true, "Max discount cap is required"],
      min: [1, "Max discount cap must be at least ₹1"],
      max: [1000, "Max discount cap cannot exceed ₹1000"]
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Min order value cannot be negative"],
      max: [5000, "Min order value cannot exceed ₹5000"]
    },
    expiryDate: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
      max: [10000, "Usage limit cannot exceed 10,000"]
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.pre('save', function (next) {
  if (this.expiryDate && this.expiryDate < new Date().setHours(0, 0, 0, 0)) {
    return next(new Error("Coupon expiry date cannot be in the past."));
  }
  
  if (this.minOrderValue < this.maxDiscountCap) {
    return next(new Error("Minimum order value must be greater than or equal to the maximum discount cap."));
  }
  
  next();
});

// for high-speed lookups across coupons, analytics, and booking history
couponSchema.index({ code: 1, isActive: 1 });

export const Coupon = mongoose.model("Coupon", couponSchema);
