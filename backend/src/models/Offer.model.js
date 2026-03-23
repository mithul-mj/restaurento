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
    },
    minOrderValue: {
      type: Number, // Bill Threshold (₹)
      default: 0,
    },
    usageLimit: {
      type: Number, // Total number of times this can be used
      required: true,
    },
    initialUsageLimit: {
      type: Number, // The original limit set by the restaurant
      required: true,
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

// Index to quickly find active offers for a specific restaurant
offerSchema.index({ restaurantId: 1, isActive: 1 });

export const Offer = mongoose.model("Offer", offerSchema);
