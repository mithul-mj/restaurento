import { User } from "../../models/User.model.js";
import ROLES from "../../constants/roles.js";
import { Admin } from "../../models/Admin.model.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { sendVerificationOtp, verifyOtp } from "../../services/commonAuth.service.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { WalletTransaction } from '../../models/WalletTransaction.model.js'
import mongoose from "mongoose";
import { success } from "zod";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: "User not found" });
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      user: {
        walletBalance: user.walletBalance,
        address: user.location.address,
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, address } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: "User not found" });
    }


    if (req.file) {
      user.avatar = req.file.path;
    }

    if (fullName) user.fullName = fullName;
    if (address) {
      user.location = user.location || {};
      user.location.address = address;
    }

    await user.save();

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        fullName: user.fullName,
        address: user.location?.address,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changeEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;

    const [user, restaurant, admin] = await Promise.all([
      User.findOne({ email }),
      Restaurant.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (user || restaurant || admin) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Email already exists in our system" });
    }

    await sendVerificationOtp(email);

    return res.status(STATUS_CODES.OK).json({ success: true, message: "Verification code sent to your new email" });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailChange = async (req, res, next) => {
  try {
    const { newEmail, otp } = req.body;
    const userId = req.user._id;

    const isValid = await verifyOtp(newEmail, otp);

    if (!isValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: "User not found" });

    user.email = newEmail;
    await user.save();

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Email updated successfully",
      user: { email: user.email }
    });
  } catch (error) {
    next(error);
  }
};


export const getMyWalletHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const transactions = await WalletTransaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metaData: [{ $count: "total" }],
          transactions: [
            { $skip: skip }, { $limit: limit }
          ]
        }
      }
    ])

    const data = transactions[0];

    const totalTransactions = data.metaData.length > 0 ? data.metaData[0].total : 0;

    const walletTransactions = data.transactions;

    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(STATUS_CODES.OK).json({
      success: true,
      transactions: walletTransactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });



  } catch (error) {
    next(error);
  }
}

export const getWalletBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("walletBalance");
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: "User not found" });
    }
    return res.status(STATUS_CODES.OK).json({ success: true, walletBalance: user.walletBalance });
  } catch (error) {
    next(error);
  }
};