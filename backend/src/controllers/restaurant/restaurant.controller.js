import mongoose from "mongoose";
import ROLES from "../../constants/roles.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { Schedule } from "../../models/Schedule.model.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import jwt from 'jsonwebtoken';
import { env } from "../../config/env.config.js";
import { Booking } from "../../models/Booking.model.js";

export const preApprovalRestaurant = async (req, res, next) => {
    try {
        const { restaurantName, restaurantPhone, address, latitude, longitude } = req.body;
        const { restaurantLicense, businessCert, fssaiCert, ownerIdCert } = req.files;
        const currentRestaurant = await Restaurant.findById(req.user._id);
        const getFilePath = (fieldName) => {
            if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
                return req.files[fieldName][0].path;
            }
            return currentRestaurant?.documents?.[fieldName];
        };

        const documents = {
            restaurantLicense: getFilePath('restaurantLicense'),
            businessCert: getFilePath('businessCert'),
            fssaiCert: getFilePath('fssaiCert'),
            ownerIdCert: getFilePath('ownerIdCert'),
        };

        const requiredDocs = ['restaurantLicense', 'businessCert', 'fssaiCert', 'ownerIdCert'];
        const missingDocs = requiredDocs.filter(doc => !documents[doc]);

        if (missingDocs.length > 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: `Missing required documents: ${missingDocs.join(', ')}`
            });
        }

        if (currentRestaurant.submissionAttempts >= 3) {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                message: "Maximum submission attempts (3) reached. Please contact support."
            });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    restaurantName,
                    restaurantPhone,
                    address,
                    location: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    documents,
                    verificationStatus: 'pending'
                },
                $inc: { submissionAttempts: 1 }
            },
            { new: true }
        );
        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: "Restaurant not found"
            })
        }
        return res.status(STATUS_CODES.OK).json({
            success: true,
            message: "Restaurant registered successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getRestaurantProfile = async (req, res, next) => {
    try {
        const [restaurant, activeSchedule] = await Promise.all([
            Restaurant.findById(req.user._id).lean(),
            Schedule.findOne({
                restaurantId: req.user._id,
                validFrom: { $lte: new Date() }
            }).sort({ validFrom: -1 }).lean()
        ]);

        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
        }

        const mergedProfile = {
            ...restaurant,
            ...(activeSchedule ? {
                openingHours: activeSchedule.openingHours,
                slotConfig: activeSchedule.slotConfig,
                totalSeats: activeSchedule.totalSeats,
                slotPrice: activeSchedule.slotPrice,
            } : {})
        };

        return res.status(STATUS_CODES.OK).json({ success: true, restaurant: mergedProfile });
    } catch (error) {
        next(error);
    }
};

export const updateRestaurantProfile = async (req, res, next) => {
    try {
        const {
            description,
            totalSeats,
            slotPrice,
            slotConfig,
            openingHours,
            tags,
            existingImages
        } = req.body;

        const restaurant = await Restaurant.findById(req.user._id);
        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
        }

        // Static profile updates
        if (description) restaurant.description = description;
        if (tags) restaurant.tags = tags;

        // Image management
        let currentImages = [];
        if (existingImages) {
            try {
                if (typeof existingImages === 'string') {
                    if (existingImages.startsWith('[') && existingImages.endsWith(']')) {
                        currentImages = JSON.parse(existingImages);
                    } else {
                        currentImages = [existingImages];
                    }
                } else if (Array.isArray(existingImages)) {
                    currentImages = existingImages;
                } else {
                    currentImages = [existingImages];
                }
            } catch (e) {
                currentImages = Array.isArray(existingImages) ? existingImages : [existingImages];
            }
        }

        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => file.path);
            currentImages = [...currentImages, ...newImageUrls];
        }
        restaurant.images = currentImages;

        // Timing/Seats/Price changes trigger the 5-day lead time rule
        if (totalSeats || slotPrice || slotConfig || openingHours) {
            const transitionDate = new Date();
            transitionDate.setDate(transitionDate.getDate() + 5);
            transitionDate.setUTCHours(0, 0, 0, 0); // Start of the 6th day

            const scheduleData = {
                restaurantId: req.user._id,
                validFrom: transitionDate,
                totalSeats: totalSeats ? Number(totalSeats) : undefined,
                slotPrice: slotPrice ? Number(slotPrice) : undefined,
                slotConfig: slotConfig ? (typeof slotConfig === 'string' ? JSON.parse(slotConfig) : slotConfig) : undefined,
                openingHours: openingHours ? (typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours) : undefined
            };

            // Fallback to previous settings for any fields not being changed
            const lastSchedule = await Schedule.findOne({ restaurantId: req.user._id }).sort({ validFrom: -1 });
            if (lastSchedule) {
                scheduleData.totalSeats = scheduleData.totalSeats ?? lastSchedule.totalSeats;
                scheduleData.slotPrice = scheduleData.slotPrice ?? lastSchedule.slotPrice;
                scheduleData.slotConfig = scheduleData.slotConfig ?? lastSchedule.slotConfig;
                scheduleData.openingHours = scheduleData.openingHours ?? lastSchedule.openingHours;
            }

            await Schedule.create(scheduleData);
        }

        await restaurant.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: "Profile updated successfully. Timing changes will take effect in 5 days."
        });
    } catch (error) {
        next(error);
    }
};

export const updateRestaurantSettings = async (req, res, next) => {
    try {
        const { isTemporaryClosed } = req.body;

        if (typeof isTemporaryClosed !== 'boolean') {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid status value" });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.user._id,
            { $set: { isTemporaryClosed } },
            { new: true }
        );

        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
        }

        return res.status(STATUS_CODES.OK).json({
            success: true,
            message: `Restaurant is now ${isTemporaryClosed ? 'closed' : 'open'} temporarily`,
            isTemporaryClosed: restaurant.isTemporaryClosed
        });
    } catch (error) {
        next(error);
    }
};

export const getMenu = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = (req.query.search || "").trim();
        const category = req.query.category || "All";

        const skip = (page - 1) * limit;

        const matchStage = {};

        if (search) {
            matchStage.$or = [
                { "menuItems.name": { $regex: search, $options: "i" } },
                { "menuItems.description": { $regex: search, $options: "i" } },
            ];
        }

        if (category && category !== "All") {
            matchStage["menuItems.categories"] = category;
        }

        const result = await Restaurant.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
            { $unwind: "$menuItems" },
            { $match: matchStage },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        { $replaceRoot: { newRoot: "$menuItems" } },
                    ],
                    totalFiltered: [{ $count: "count" }],
                },
            },
        ]);

        const menuItems = result[0].data || [];
        const totalFilteredCount = result[0].totalFiltered[0]
            ? result[0].totalFiltered[0].count
            : 0;

        const totalPages = Math.ceil(totalFilteredCount / limit);

        res.status(STATUS_CODES.OK).json({
            status: "success",
            meta: {
                totalCount: totalFilteredCount,
                currentPage: page,
                totalPages: totalPages,
                perPage: limit,
            },
            data: menuItems,
        });
    } catch (error) {
        next(error);
    }
};

export const toggleItemAvailability = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const restaurant = await Restaurant.findById(req.user._id);

        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
        }

        const menuItem = restaurant.menuItems.id(itemId);

        if (!menuItem) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Menu item not found" });
        }

        menuItem.isAvailable = !menuItem.isAvailable;
        await restaurant.save();

        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: `Item availability updated successfully`,
            data: {
                _id: menuItem._id,
                isAvailable: menuItem.isAvailable,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateMenuItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { name, price, description, categories, isAvailable } = req.body;

        const restaurant = await Restaurant.findById(req.user._id);

        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
        }

        const menuItem = restaurant.menuItems.id(itemId);

        if (!menuItem) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Menu item not found" });
        }

        if (name) menuItem.name = name;
        if (price) menuItem.price = price;
        if (description) menuItem.description = description;

        if (categories) {
            menuItem.categories = Array.isArray(categories) ? categories : [categories];
        }

        if (typeof isAvailable !== 'undefined') menuItem.isAvailable = isAvailable === 'true' || isAvailable === true;

        if (req.file) {
            menuItem.image = req.file.path;
        }

        await restaurant.save();

        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Menu item updated successfully",
            data: menuItem,
        });
    } catch (error) {
        next(error);
    }
};

export const addMenuItem = async (req, res, next) => {
    try {
        const { name, price, description, categories } = req.body;

        const restaurant = await Restaurant.findById(req.user._id);

        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
        }

        const newItem = {
            name,
            price,
            description,
            categories: Array.isArray(categories) ? categories : [categories],
            image: req.file ? req.file.path : null,
            isAvailable: true
        };

        restaurant.menuItems.push(newItem);
        await restaurant.save();

        res.status(STATUS_CODES.CREATED).json({
            status: "success",
            message: "Menu item added successfully",
            data: restaurant.menuItems[restaurant.menuItems.length - 1],
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMenuItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const restaurant = await Restaurant.findByIdAndUpdate(req.user._id, {
            $pull: {
                menuItems: { _id: itemId }
            }
        });
        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
        }
        return res.status(STATUS_CODES.OK).json({
            message: "Menu item removed successfully",
            menuItems: restaurant.menuItems,
        });

    } catch (error) {
        next(error)
    }
};

export const getRestaurantBookings = async (req, res, next) => {
    try {
        const restaurantId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = (req.query.search || "").trim();
        const status = req.query.status || "all";

        const skip = (page - 1) * limit;

        const now = new Date();
        const today = new Date(now);
        today.setUTCHours(0, 0, 0, 0);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let matchQuery = {
            restaurantId: new mongoose.Types.ObjectId(restaurantId)
        };

        if (status === "upcoming") {
            matchQuery.status = "approved";
            matchQuery.$or = [
                { bookingDate: { $gt: today } },
                {
                    bookingDate: { $eq: today },
                    slotEndTime: { $gt: currentMinutes }
                }
            ];
        } else if (status === "completed") {
            matchQuery.$or = [
                { status: "checked-in" },
                {
                    status: "approved",
                    $or: [
                        { bookingDate: { $lt: today } },
                        {
                            bookingDate: { $eq: today },
                            slotEndTime: { $lte: currentMinutes }
                        }
                    ]
                }
            ];
        } else if (status === "canceled" || status === "cancelled") {
            matchQuery.status = "canceled";
        } else {
            // all status
            matchQuery.status = { $in: ["approved", "checked-in", "canceled"] };
        }

        const aggregate = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" }
        ];

        if (search) {
            aggregate.push({
                $match: {
                    $or: [
                        { "user.fullName": { $regex: search, $options: "i" } },
                        { "user.email": { $regex: search, $options: "i" } }
                    ]
                }
            });
        }

        const result = await Booking.aggregate([
            ...aggregate,
            { $sort: { bookingDate: -1, slotTime: -1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            }
        ]);

        const total = result[0].metadata[0]?.total || 0;
        const bookings = result[0].data || [];

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: bookings,
            meta: {
                totalCount: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                perPage: limit
            }
        });
    } catch (error) {
        next(error);
    }
};

export const verifyCheckIn = async (req, res, next) => {
    try {
        const { token } = req.body;
        const restaurantId = req.user._id;

        if (!token) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: 'No token found'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, env.QR_CODE_SECRET);
        } catch (error) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                message: "Invalid or expired QR code"
            });
        }

        const { bid, rid } = decoded;
        if (!bid || !rid) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: "Invalid token payload"
            });
        }

        if (rid !== restaurantId.toString()) {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                message: "Unauthorized: this booking belongs to another restaurant"
            });
        }

        const booking = await Booking.findById(bid).populate("userId", "fullName email");
        if (!booking) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: "Booking record not found"
            });
        }

        if (booking.status === "checked-in") {
            return res.status(STATUS_CODES.CONFLICT).json({ message: "Guest is already checked-in" });
        }

        booking.status = "checked-in";
        await booking.save();

        return res.status(STATUS_CODES.OK).json({
            success: true,
            message: "Check-in successful!",
            guest: {
                name: booking.userId?.fullName || "Guest",
                guests: booking.guests,
                totalAmount: booking.totalAmount,
                preOrders: booking.preOrderItems || []
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getBookingById = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const restaurantId = req.user._id;

        const booking = await Booking.findOne({
            _id: bookingId,
            restaurantId: restaurantId
        }).populate("userId", "fullName email phone");

        if (!booking) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: "Booking not found"
            });
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: booking
        });
    } catch (error) {
        next(error);
    }
};
export const updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const restaurantId = req.user._id;

        const validStatuses = ["approved", "cancelled", "completed", "checked-in", "canceled"];
        if (!validStatuses.includes(status)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: "Invalid status"
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            restaurantId: restaurantId
        });

        if (!booking) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: "Booking not found"
            });
        }

        if (status === 'canceled' || status === 'cancelled') {
            booking.status = 'canceled';
            booking.canceledBy = ROLES.RESTAURANT;
        } else {
            booking.status = status;
        }

        await booking.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: "Booking status updated successfully",
            data: booking
        });
    } catch (error) {
        next(error);
    }
};
export const getRestaurantStats = async (req, res, next) => {
    try {
        const restaurantId = req.user._id;

        const stats = await Booking.aggregate([
            {
                $match: {
                    restaurantId: new mongoose.Types.ObjectId(restaurantId),
                    status: { $in: ['approved', 'checked-in', 'canceled'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: {
                        $sum: { $cond: [{ $in: ["$status", ["approved", "checked-in"]] }, "$totalAmount", 0] }
                    },
                    totalRefunded: {
                        $sum: { $cond: [{ $eq: ["$status", "canceled"] }, "$totalAmount", 0] }
                    },
                    successfulBookings: {
                        $sum: { $cond: [{ $in: ["$status", ["approved", "checked-in"]] }, 1, 0] }
                    },
                    refundedBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalEarnings: 0,
            totalRefunded: 0,
            successfulBookings: 0,
            refundedBookings: 0
        };

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                totalRevenue: result.totalEarnings,
                totalRefunded: result.totalRefunded,
                netRevenue: result.totalEarnings - result.totalRefunded,
                bookingStats: {
                    successful: result.successfulBookings,
                    refunded: result.refundedBookings,
                    total: result.successfulBookings + result.refundedBookings
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
