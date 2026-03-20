import { Coupon } from "../models/Coupon.model.js";

export const getAvailableCoupons = async (req, res, next) => {
    try {
        const dateNow = new Date();

        const coupons = await Coupon.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { expiryDate: { $gt: dateNow } },
                        { expiryDate: { $exists: false } },
                        { expiryDate: null }]
                }
            },
            {
                $lookup: {
                    from: "bookings",
                    let: { coupon_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$appliedCoupon.couponId", "$$coupon_id"] },
                                        { $ne: ["$status", "canceled"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "usageHistory"
                }
            },
            {
                $addFields: {
                    currentUsageCount: {
                        $size: "$usageHistory"
                    }
                }
            },
            {
                $match: {
                    $expr: {
                        $or: [
                            { $not: ["$usageLimit"] },
                            { $eq: ["$usageLimit", null] },
                            { $lt: ["$currentUsageCount", "$usageLimit"] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    code: 1,
                    description: 1,
                    discountValue: 1,
                    maxDiscountCap: 1,
                    minOrderValue: 1,
                    expiryDate: 1
                }
            },
            {
                $sort: { discountValue: -1 }
            }

        ])

        res.status(200).json({
            success: true,
            coupons
        });
    } catch (error) {
        next(error);
    }
};