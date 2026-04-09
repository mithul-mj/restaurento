import { Coupon } from "../../models/Coupon.model.js";
import { Booking } from "../../models/Booking.model.js";
import mongoose from "mongoose";
import STATUS_CODES from "../../constants/statusCodes.js";
import { ApiError } from "../../utils/errors/ApiError.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages.js";

export const getAllCoupons = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "All";
    const sortBy = req.query.sortBy || "Newest";
    const skip = (page - 1) * limit;
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";

    const dateNow = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(dateNow.getDate() + 7);

    let filterObj = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filterObj.createdAt = { $lte: end, $gte: start };
    }
    if (search) {
      filterObj.code = { $regex: search, $options: "i" };
    }
    if (status === "Active") {
      filterObj.isActive = true;
      filterObj.$or = [{ expiryDate: { $gt: dateNow } }, { expiryDate: null }];
    } else if (status === "Expired") {
      filterObj.$or = [{ isActive: false }, { expiryDate: { $lte: dateNow } }];
    }

    let sortObj = { createdAt: -1 };
    if (sortBy === "Oldest") sortObj = { createdAt: 1 };
    if (sortBy === "Discount High to Low") sortObj = { discountValue: -1 };
    if (sortBy === "Discount Low to High") sortObj = { discountValue: 1 };

    // Execute all 4 Mongo operations concurrently instead of waiting for each one
    const [activeCouponsCount, expiringThisWeek, totalCoupons, coupons] =
      await Promise.all([
        Coupon.countDocuments({
          isActive: true,
          $or: [{ expiryDate: { $gt: dateNow } }, { expiryDate: null }],
        }),
        Coupon.countDocuments({
          expiryDate: { $gte: dateNow, $lte: nextWeek },
        }),
        Coupon.countDocuments(filterObj),
        Coupon.find(filterObj).sort(sortObj).skip(skip).limit(limit),
      ]);

    const totalPages = Math.ceil(totalCoupons / limit);

    const formattedCoupons = coupons.map((coupon) => {
      const isExpired =
        coupon.expiryDate && new Date(coupon.expiryDate) < dateNow;
      let validityInfo = "";

      if (isExpired) {
        validityInfo = "Expired";
      } else if (coupon.expiryDate) {
        const diffTime = Math.abs(new Date(coupon.expiryDate) - dateNow);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        validityInfo = `${diffDays} days left`;
      } else {
        validityInfo = "No expiry limit";
      }

      const validityDate = coupon.expiryDate
        ? new Date(coupon.expiryDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Lifetime";

      return {
        _id: coupon._id,
        code: coupon.code,
        discount: `${coupon.discountValue}% Off`,
        discountDesc: coupon.maxDiscountCap
          ? `Up to ₹${coupon.maxDiscountCap}`
          : "No upper limit",
        validityDate,
        validityInfo,
        status: isExpired || !coupon.isActive ? "Expired" : "Active",
        isActive: coupon.isActive,
        raw: coupon,
      };
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: formattedCoupons,
      stats: {
        activeCoupons: activeCouponsCount,
        expiringThisWeek,
      },
      pagination: {
        totalCoupons,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountValue,
      maxDiscountCap,
      minOrderValue,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });
    if (existingCoupon) {
      throw new ApiError(STATUS_CODES.CONFLICT, ERROR_MESSAGES.COUPON_EXISTS);
    }
    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description,
      discountValue,
      maxDiscountCap,
      minOrderValue,
      expiryDate,
      usageLimit,
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.COUPON_CREATED,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountValue,
      maxDiscountCap,
      minOrderValue,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.COUPON_NOT_FOUND);
    }
    // If code is being updated, check for uniqueness
    if (code && code.toUpperCase().trim() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: code.toUpperCase().trim(),
      });
      if (existingCoupon) {
        throw new ApiError(
          STATUS_CODES.CONFLICT,
          ERROR_MESSAGES.COUPON_EXISTS,
        );
      }
      coupon.code = code.toUpperCase().trim();
    }
    if (description !== undefined) coupon.description = description;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (maxDiscountCap !== undefined) coupon.maxDiscountCap = maxDiscountCap;
    if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;
    await coupon.save();
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.COUPON_UPDATED,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.COUPON_NOT_FOUND);
    }
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.COUPON_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id).lean();

    if (!coupon) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.COUPON_NOT_FOUND);
    }

    // Fetch comprehensive usage stats for this specific coupon in one go
    const [usageCount, usageStats, dailyHistory] = await Promise.all([
      Booking.countDocuments({
        "appliedCoupon.couponId": id,
        status: { $ne: "canceled" },
      }),
      Booking.aggregate([
        {
          $match: {
            "appliedCoupon.couponId": new mongoose.Types.ObjectId(id),
            status: { $ne: "canceled" },
          },
        },
        {
          $group: {
            _id: null,
            totalRedeemedValue: {
              $sum: "$appliedCoupon.discountAmountApplied",
            },
            avgOrderSize: { $avg: "$totalAmount" },
          },
        },
      ]),
      Booking.aggregate([
        {
          $match: {
            "appliedCoupon.couponId": new mongoose.Types.ObjectId(id),
            status: { $ne: "canceled" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            savings: { $sum: "$appliedCoupon.discountAmountApplied" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: {
        ...coupon,
        usageCount,
        stats: usageStats[0] || { totalRedeemedValue: 0, avgOrderSize: 0 },
        dailyHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};
