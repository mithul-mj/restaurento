import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config.js";

export const authPlugin = (schema, options = {}) => {
  const { role } = options;

  schema.pre("save", async function () {
    if (!this.isModified("password")) return;

    if (this.password && this.password.length > 50) {
      throw new Error("Password cannot exceed 50 characters");
    }

    this.password = await bcrypt.hash(this.password, 10);
  });

  schema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  schema.methods.generateAccessToken = function (overrideRole) {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        role: overrideRole || role || this.role || "USER",
      },
      env.JWT_ACCESS_SECRET,
      {
        expiresIn: env.JWT_ACCESS_TOKEN_EXPIRE,
      }
    );
  };

  schema.methods.generateRefreshToken = function (overrideRole) {
    return jwt.sign(
      {
        _id: this._id,
        role: overrideRole || role || this.role || "USER",
      },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_TOKEN_EXPIRE,
      }
    );
  };
};
