import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    onModel: {
      type: String,
      required: true,
      enum: ["USER", "RESTAURANT", "ADMIN"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "7d",
    },
  },
  {
    timestamps: true,
  }
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
