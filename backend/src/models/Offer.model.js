import mongoose, { Schema } from "mongoose";

const offerSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    discountValue: {
      type: Number, // Flat amount in ₹
      required: true,
      min: [1, "Discount must be at least ₹1"],
      max: [1000, "Discount cannot exceed ₹1000"]
    },
    minOrderValue: {
      type: Number, // Bill Threshold (₹)
      default: 0,
      min: [0, "Minimum bill cannot be negative"],
      max: [5000, "Minimum bill threshold cannot exceed ₹5000"]
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
  },
  { timestamps: true }
);

// Validation: Discount should be less than the minimum bill threshold
offerSchema.pre('save', function (next) {
  if (this.discountValue >= this.minOrderValue) {
    const error = new Error("Discount must be less than the minimum bill threshold.");
    return next(error);
  }
  next();
});

// Index to quickly find active offers for a specific restaurant
offerSchema.index({ restaurantId: 1, isActive: 1 });

export const Offer = mongoose.model("Offer", offerSchema);
