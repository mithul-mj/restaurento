import mongoose from "mongoose";
import ROLES from "../../constants/roles.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { Schedule } from "../../models/Schedule.model.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import jwt from 'jsonwebtoken';
import { env } from "../../config/env.config.js";
import { Booking } from "../../models/Booking.model.js";
import { User } from "../../models/User.model.js";
import { WalletTransaction } from "../../models/WalletTransaction.model.js";
import { Offer } from "../../models/Offer.model.js";
import { sendNotification } from "../../utils/notification.util.js";
import { format12hr } from "../../utils/timeUtils.js";




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

        const isTemporaryClosed = activeSchedule?.closedTill && new Date(activeSchedule.closedTill) > new Date();

        const mergedProfile = {
            ...restaurant,
            isTemporaryClosed,
            closedTill: activeSchedule?.closedTill || null,
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
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { isTemporaryClosed, closedTill, shouldCancelBookings } = req.body;

        const restaurant = await Restaurant.findById(req.user._id).session(session);
        if (!restaurant) {
            await session.abortTransaction();
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
        }

        if (isTemporaryClosed === true && closedTill) {
            // CLOSING
            await Schedule.findOneAndUpdate(
                { restaurantId: req.user._id, validFrom: { $lte: new Date() } },
                { $set: { closedTill: new Date(closedTill) } },
                { sort: { validFrom: -1 }, session }
            );

            if (shouldCancelBookings) {
                const now = new Date();
                const today = new Date(now);
                today.setUTCHours(0, 0, 0, 0);
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const endLimit = new Date(closedTill);
                endLimit.setUTCHours(23, 59, 59, 999);
                
                const reopeningDate = new Date(closedTill);
                reopeningDate.setUTCHours(0, 0, 0, 0);
                const reopeningMinutes = new Date(closedTill).getHours() * 60 + new Date(closedTill).getMinutes();
                
                const matchQuery = {
                    restaurantId: req.user._id,
                    status: 'approved',
                    $or: [
                        // 1. Any day strictly between today and re-opening day
                        {
                            bookingDate: { $gt: today, $lt: reopeningDate }
                        },
                        // 2. Today: after now, but only if re-opening is after today
                        {
                            bookingDate: { $eq: today },
                            slotEndTime: { $gt: currentMinutes },
                            $expr: {
                              $or: [
                                { $gt: [reopeningDate, today] },
                                { $lt: ["$slotTime", reopeningMinutes] }
                              ]
                            }
                        },
                        // 3. Re-opening day: only slots starting before re-opening time
                        {
                            bookingDate: { $eq: reopeningDate },
                            slotTime: { $lt: reopeningMinutes }
                        }
                    ]
                };

                const affectedBookings = await Booking.find(matchQuery).session(session);

                for (const booking of affectedBookings) {
                    booking.status = 'canceled';
                    booking.canceledBy = ROLES.RESTAURANT;
                    await booking.save({ session });

                    // Refund to User Wallet
                    await User.findByIdAndUpdate(
                        booking.userId,
                        { $inc: { walletBalance: booking.totalAmount } },
                        { session }
                    );

                    // Create Wallet Transaction
                    await WalletTransaction.create([{
                        userId: booking.userId,
                        bookingId: booking._id,
                        amount: booking.totalAmount,
                        description: `Refund: Restaurant Temporary Closure (${restaurant.restaurantName})`
                    }], { session });

                    // Send Notification (Ideally async, but following existing pattern)
                    await sendNotification(req, {
                        recipientId: booking.userId,
                        title: "Booking Cancelled - Restaurant Temporarily Closed",
                        message: `Your booking at ${restaurant.restaurantName} on ${new Date(booking.bookingDate).toLocaleDateString()} was cancelled due to a temporary closure until ${new Date(closedTill).toLocaleDateString()}. ₹${booking.totalAmount} refunded to wallet.`
                    });
                }
            }
        } else if (isTemporaryClosed === false) {
            // RE-OPENING
            await Schedule.findOneAndUpdate(
                { restaurantId: req.user._id },
                { $unset: { closedTill: "" } },
                { sort: { validFrom: -1 }, session }
            );
        }

        await session.commitTransaction();
        return res.status(STATUS_CODES.OK).json({
            success: true,
            message: `Restaurant is now ${isTemporaryClosed ? 'closed' : 'open'} temporarily`,
            isTemporaryClosed: isTemporaryClosed,
            closedTill: isTemporaryClosed ? closedTill : null
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const getAffectedBookingsCount = async (req, res, next) => {
    try {
        const { closedTill } = req.query;
        if (!closedTill) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Date is required" });
        }

        const now = new Date();
        const today = new Date(now);
        today.setUTCHours(0, 0, 0, 0);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const endLimit = new Date(closedTill);
        endLimit.setUTCHours(23, 59, 59, 999); 

        const reopeningDate = new Date(closedTill);
        reopeningDate.setUTCHours(0, 0, 0, 0);
        const reopeningMinutes = new Date(closedTill).getHours() * 60 + new Date(closedTill).getMinutes();

        const matchQuery = {
            restaurantId: req.user._id,
            status: 'approved',
            $or: [
                // 1. Any day strictly between today and re-opening day
                {
                    bookingDate: { $gt: today, $lt: reopeningDate }
                },
                // 2. Today: after now, but only if re-opening is after today
                {
                    bookingDate: { $eq: today },
                    slotEndTime: { $gt: currentMinutes },
                    $expr: {
                        $or: [
                            { $gt: [reopeningDate, today] },
                            { $lt: ["$slotTime", reopeningMinutes] }
                        ]
                    }
                },
                // 3. Re-opening day: only slots starting before re-opening time
                {
                    bookingDate: { $eq: reopeningDate },
                    slotTime: { $lt: reopeningMinutes }
                }
            ]
        };

        const count = await Booking.countDocuments(matchQuery);

        return res.status(STATUS_CODES.OK).json({
            success: true,
            count
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

        const matchStage = {
            "menuItems.isDeleted": { $ne: true }
        };

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

        if (!menuItem || menuItem.isDeleted) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Menu item not found or already deleted" });
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

        if (!menuItem || menuItem.isDeleted) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Menu item not found or already deleted" });
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
        const restaurant = await Restaurant.findOneAndUpdate(
            { _id: req.user._id, "menuItems._id": itemId },
            {
                $set: { "menuItems.$.isDeleted": true }
            },
            { new: true }
        );

        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Menu item or Restaurant not found" });
        }

        // Return only non-deleted items to stay consistent
        const activeMenuItems = restaurant.menuItems.filter(item => !item.isDeleted);

        return res.status(STATUS_CODES.OK).json({
            message: "Menu item removed successfully",
            menuItems: activeMenuItems,
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

        const { bid } = decoded;
        if (!bid || !mongoose.Types.ObjectId.isValid(bid)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: "Invalid token payload"
            });
        }

        const booking = await Booking.findById(bid).populate("userId", "fullName email");
        if (!booking) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: "Booking record not found"
            });
        }

        // Verify the booking belongs to the scanning restaurant
        if (booking.restaurantId.toString() !== restaurantId.toString()) {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                message: "Unauthorized: this booking belongs to another restaurant"
            });
        }

        if (booking.status === "checked-in") {
            return res.status(STATUS_CODES.CONFLICT).json({ message: "Guest is already checked-in" });
        }

        if (booking.status === "canceled") {
            return res.status(STATUS_CODES.FORBIDDEN).json({ message: "This booking has been canceled" });
        }

        if (booking.status !== "approved") {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: `Cannot check-in. Booking status is: ${booking.status}` });
        }

        /*
        // --- ARRIVAL TIME VALIDATION ---
        const now = new Date();
        const bookingDate = new Date(booking.bookingDate);
        
        // Reset both to midnight for accurate date-only comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);

        // Arriving on the wrong day (too early)
        if (bookingDate > today) {
            return res.status(STATUS_CODES.FORBIDDEN).json({ 
                message: "Too Early: This booking is for a future date." 
            });
        }

        // Arriving today, but far too early for the specific slot
        // We define 'too early' as arriving more than 30 minutes BEFORE the start time.
        if (bookingDate.getTime() === today.getTime()) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const earlyBuffer = 30; // 30-minute grace period before slot starts

            if (currentMinutes < (booking.slotTime - earlyBuffer)) {
                return res.status(STATUS_CODES.FORBIDDEN).json({
                    message: "Too Early: Check-in opens 30 minutes before your slot."
                });
            }
        }
        */

        booking.status = "checked-in";
        await booking.save();

        return res.status(STATUS_CODES.OK).json({
            success: true,
            message: "Check-in successful!",
            guest: {
                name: booking.userId?.fullName || "Guest",
                email: booking.userId?.email || "N/A",
                guests: booking.guests,
                totalAmount: booking.totalAmount,
                preOrders: booking.preOrderItems || [],
                bookingDate: booking.bookingDate,
                slotTime: booking.slotTime,
                slotPrice: booking.slotPrice || 0,
                tax: booking.tax || 0,
                platformFee: booking.platformFee || 0,
                discountAmount: (booking.appliedCoupon?.discountAmountApplied || 0) + (booking.appliedOffer?.discountValue || 0),
                couponCode: booking.appliedCoupon?.code || null
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
            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                // Re-fetch inside session
                const sessionBooking = await Booking.findOne({ _id: bookingId, restaurantId }).session(session);

                if (!sessionBooking || sessionBooking.status === 'canceled' || sessionBooking.status === 'checked-in') {
                    await session.abortTransaction();
                    const message = sessionBooking?.status === 'checked-in'
                        ? "Cannot cancel a booking that is already checked-in"
                        : "Booking already canceled or not found";
                    return res.status(STATUS_CODES.BAD_REQUEST).json({ message });
                }

                // 1. Mark as canceled
                sessionBooking.status = 'canceled';
                sessionBooking.canceledBy = ROLES.RESTAURANT;
                await sessionBooking.save({ session });

                // 3. Refund to User Wallet
                await User.findByIdAndUpdate(
                    sessionBooking.userId,
                    { $inc: { walletBalance: sessionBooking.totalAmount } },
                    { session }
                );

                // 4. Create Wallet Transaction
                await WalletTransaction.create([{
                    userId: sessionBooking.userId,
                    bookingId: sessionBooking._id,
                    amount: sessionBooking.totalAmount,
                    description: `Refund (Restaurant Cancellation): Booking at ${restaurantId}` // Ideally should use restaurantName from booking
                }], { session });

                await session.commitTransaction();

                // Send live notification to the user
                const restaurant = await Restaurant.findById(restaurantId).select("restaurantName").lean();
                await sendNotification(req, {
                    recipientId: sessionBooking.userId,
                    title: "Booking Cancelled by Restaurant",
                    message: `Your booking at ${restaurant?.restaurantName || "the restaurant"} on ${new Date(sessionBooking.bookingDate).toLocaleDateString()} at ${format12hr(sessionBooking.slotTime)} was cancelled by the merchant. ₹${sessionBooking.totalAmount} refunded to wallet.`
                });




                return res.status(STATUS_CODES.OK).json({

                    success: true,
                    message: "Booking canceled by restaurant. Amount refunded to user.",
                    data: sessionBooking
                });
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } else {
            booking.status = status;
            await booking.save();
        }

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
        const dateFilter = req.query.dateFilter || "thisMonth";
        const now = new Date();

        // 1. Build date filter for all metrics
        let dateMatch = {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
        };

        if (dateFilter === "thisWeek") {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);
            dateMatch.bookingDate = { $gte: startOfWeek };
        } else if (dateFilter === "thisMonth") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateMatch.bookingDate = { $gte: startOfMonth };
        } else if (dateFilter === "thisYear") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateMatch.bookingDate = { $gte: startOfYear };
        }

        // 2. Fetch Aggregated Metrics
        const stats = await Booking.aggregate([
            { $match: dateMatch },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $cond: [{ $in: ["$status", ["approved", "checked-in"]] }, "$totalAmount", 0] }
                    },
                    canceledBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] }
                    },
                    successfulBookings: {
                        $sum: { $cond: [{ $in: ["$status", ["approved", "checked-in"]] }, 1, 0] }
                    }
                }
            }
        ]);

        const metricResult = stats[0] || {
            totalRevenue: 0,
            canceledBookings: 0,
            successfulBookings: 0
        };

        // 3. Generate Sales Trend for Graph
        let trendAggregate = [];
        let trendFormat = [];

        if (dateFilter === "thisYear") {
            trendAggregate = [
                {
                    $match: {
                        ...dateMatch,
                        status: { $in: ["approved", "checked-in"] }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$bookingDate" },
                        bookings: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ];
            trendFormat = Array.from({ length: 12 }, (_, i) => ({
                name: new Date(new Date().getFullYear(), i).toLocaleString('default', { month: 'short' }),
                bookings: 0,
                id: i + 1
            }));
        } else if (dateFilter === "thisMonth") {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            trendAggregate = [
                {
                    $match: {
                        ...dateMatch,
                        status: { $in: ["approved", "checked-in"] }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfMonth: "$bookingDate" },
                        bookings: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ];
            trendFormat = Array.from({ length: daysInMonth }, (_, i) => ({
                name: `${i + 1}`,
                bookings: 0,
                id: i + 1
            }));
        } else {
            // thisWeek
            trendAggregate = [
                {
                    $match: {
                        ...dateMatch,
                        status: { $in: ["approved", "checked-in"] }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$bookingDate" },
                        bookings: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            trendFormat = days.map((d, i) => ({
                name: d,
                bookings: 0,
                id: i + 1
            }));
        }

        const trendResult = await Booking.aggregate(trendAggregate);
        const trend = trendFormat.map(f => {
            const match = trendResult.find(t => t._id === f.id);
            return { name: f.name, bookings: match ? match.bookings : 0 };
        });

        // 4. Calculate Top Selling Dishes
        const topDishesResult = await Booking.aggregate([
            { $match: { ...dateMatch, status: { $in: ["approved", "checked-in"] } } },
            { $unwind: "$preOrderItems" },
            {
                $group: {
                    _id: "$preOrderItems.dishId",
                    name: { $first: "$preOrderItems.name" },
                    orders: { $sum: "$preOrderItems.qty" }
                }
            },
            { $sort: { orders: -1 } },
            { $limit: 10 }
        ]);

        const maxOrders = topDishesResult[0]?.orders || 1;
        const topDishes = topDishesResult.map(dish => ({
            name: dish.name,
            orders: dish.orders,
            progress: Math.round((dish.orders / maxOrders) * 100)
        }));

        // 5. Hourly Distribution (Peak Hours)
        const hourlyStatsResult = await Booking.aggregate([
            { $match: { ...dateMatch, status: { $in: ["approved", "checked-in"] } } },
            {
                $group: {
                    _id: { $floor: { $divide: ["$slotTime", 60] } }, // Assuming slotTime is in minutes
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const hourlyWiseBookings = Array.from({ length: 24 }, (_, i) => {
            const match = hourlyStatsResult.find(h => h._id === i);
            const hour = i % 12 || 12;
            const ampm = i < 12 ? 'AM' : 'PM';
            return {
                time: `${hour}${ampm}`,
                count: match ? match.count : 0,
                hour: i
            };
        });

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                metrics: {
                    totalRevenue: metricResult.totalRevenue,
                    successfulBookings: metricResult.successfulBookings,
                    canceledBookings: metricResult.canceledBookings,
                    averageOrderValue: Number(metricResult.successfulBookings) > 0
                        ? Math.round(Number(metricResult.totalRevenue) / Number(metricResult.successfulBookings))
                        : 0
                },
                trend,
                topDishes,
                hourlyWiseBookings
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getRestaurantEarnings = async (req, res, next) => {
    try {
        const restaurantId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const statusFilter = req.query.status || "all";
        const dateFilter = req.query.date || "all";
        const search = req.query.search || "";
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const skip = (page - 1) * limit;
        const now = new Date();

        // Build the date filter for all metrics
        let dateMatch = {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            status: { $in: ["approved", "checked-in"] }
        };

        if (dateFilter === "thisWeek") {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay(); // 0 is Sunday
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);
            dateMatch.createdAt = { $gte: startOfWeek };
        } else if (dateFilter === "thisMonth") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateMatch.createdAt = { $gte: startOfMonth };
        } else if (dateFilter === "thisYear") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateMatch.createdAt = { $gte: startOfYear };
        } else if (dateFilter === "custom" && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            dateMatch.createdAt = { $gte: start, $lte: end };
        }

        // Calculate overarching business metrics (Filtered by date)
        const stats = await Booking.aggregate([
            { $match: dateMatch },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$totalAmount" },
                    totalPlatformFees: { $sum: "$platformFee" },
                    successfulBookings: { $sum: 1 }
                }
            }
        ]);

        const result = stats[0] || { totalEarnings: 0, totalPlatformFees: 0, successfulBookings: 0 };
        const netPayout = result.totalEarnings - result.totalPlatformFees;

        // Generate trend data based on timeframe
        let trendAggregate = [];
        let trendFormat = [];

        if (dateFilter === "thisYear" || dateFilter === "all") {
            trendAggregate = [
                {
                    $match: {
                        restaurantId: new mongoose.Types.ObjectId(restaurantId),
                        status: { $in: ["approved", "checked-in"] },
                        createdAt: { $gte: new Date(now.getFullYear(), 0, 1) }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        earnings: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ];
            trendFormat = Array.from({ length: 12 }, (_, i) => ({
                month: new Date(new Date().getFullYear(), i).toLocaleString('default', { month: 'short' }),
                earnings: 0,
                id: i + 1
            }));
        } else if (dateFilter === "thisMonth") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            trendAggregate = [
                {
                    $match: {
                        restaurantId: new mongoose.Types.ObjectId(restaurantId),
                        status: { $in: ["approved", "checked-in"] },
                        createdAt: { $gte: startOfMonth }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfMonth: "$createdAt" },
                        earnings: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ];
            trendFormat = Array.from({ length: daysInMonth }, (_, i) => ({
                month: `${i + 1}`,
                earnings: 0,
                id: i + 1
            }));
        } else if (dateFilter === "thisWeek") {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);

            trendAggregate = [
                {
                    $match: {
                        restaurantId: new mongoose.Types.ObjectId(restaurantId),
                        status: { $in: ["approved", "checked-in"] },
                        createdAt: { $gte: startOfWeek }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$createdAt" }, // 1 (Sun) to 7 (Sat)
                        earnings: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            trendFormat = days.map((d, i) => ({
                month: d,
                earnings: 0,
                id: i + 1
            }));
        } else if (dateFilter === "custom" && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            if (dayDiff <= 60) {
                // Show daily trend for custom range
                trendAggregate = [
                    {
                        $match: {
                            restaurantId: new mongoose.Types.ObjectId(restaurantId),
                            status: { $in: ["approved", "checked-in"] },
                            createdAt: { $gte: start, $lte: end }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                day: { $dayOfMonth: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            earnings: { $sum: "$totalAmount" }
                        }
                    },
                    { $sort: { "_id.month": 1, "_id.day": 1 } }
                ];
                trendFormat = [];
                const current = new Date(start);
                while (current <= end) {
                    trendFormat.push({
                        month: `${current.getDate()} ${current.toLocaleString('default', { month: 'short' })}`,
                        earnings: 0,
                        dayNum: current.getDate(),
                        monthNum: current.getMonth() + 1
                    });
                    current.setDate(current.getDate() + 1);
                }
            } else {
                // Show monthly trend for large custom range
                trendAggregate = [
                    {
                        $match: {
                            restaurantId: new mongoose.Types.ObjectId(restaurantId),
                            status: { $in: ["approved", "checked-in"] },
                            createdAt: { $gte: start, $lte: end }
                        }
                    },
                    {
                        $group: {
                            _id: { $month: "$createdAt" },
                            earnings: { $sum: "$totalAmount" }
                        }
                    },
                    { $sort: { "_id": 1 } }
                ];
                trendFormat = [];
                const current = new Date(start);
                while (current <= end) {
                    const label = current.toLocaleString('default', { month: 'short', year: '2-digit' });
                    if (!trendFormat.find(f => f.month === label)) {
                        trendFormat.push({
                            month: label,
                            earnings: 0,
                            id: current.getMonth() + 1
                        });
                    }
                    current.setMonth(current.getMonth() + 1);
                }
            }
        } else {
            // Default to year trend
            trendAggregate = [
                {
                    $match: {
                        restaurantId: new mongoose.Types.ObjectId(restaurantId),
                        status: { $in: ["approved", "checked-in"] },
                        createdAt: { $gte: new Date(now.getFullYear(), 0, 1) }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        earnings: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ];
            trendFormat = Array.from({ length: 12 }, (_, i) => ({
                month: new Date(new Date().getFullYear(), i).toLocaleString('default', { month: 'short' }),
                earnings: 0,
                id: i + 1
            }));
        }

        const trendResult = await Booking.aggregate(trendAggregate);
        const trend = trendFormat.map(f => {
            const match = trendResult.find(t => {
                if (typeof t._id === 'object') {
                    return t._id.month === f.monthNum && t._id.day === f.dayNum;
                }
                return t._id === f.id;
            });
            return { month: f.month, earnings: match ? match.earnings : 0 };
        });

        // Build the dynamic filter object for the searchable transaction history
        let transactionFilter = {
            restaurantId: new mongoose.Types.ObjectId(restaurantId)
        };

        // Filter by payment/fulfillment status
        if (statusFilter === "paid") {
            transactionFilter.status = { $in: ["approved", "checked-in"] };
        } else if (statusFilter === "canceled") {
            transactionFilter.status = "canceled";
        } else {
            transactionFilter.status = { $in: ["approved", "checked-in", "canceled"] };
        }

        // Apply time-based boundaries to the listing (reuse dateMatch logic but include canceled if filter allows)
        if (dateMatch.createdAt) {
            transactionFilter.createdAt = dateMatch.createdAt;
        }

        const transactionAggregate = [
            { $match: transactionFilter },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            { $unwind: "$customer" }
        ];

        if (search) {
            transactionAggregate.push({
                $addFields: {
                    tempIdString: { $toString: "$_id" }
                }
            });
            transactionAggregate.push({
                $match: {
                    $or: [
                        { "customer.fullName": { $regex: search, $options: "i" } },
                        { "tempIdString": { $regex: search, $options: "i" } }
                    ]
                }
            });
        }

        const isExport = req.query.all === 'true';

        const transactionsResult = await Booking.aggregate([
            ...transactionAggregate,
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: isExport 
                        ? [{ $project: { 
                            _id: 1, 
                            userId: 1, 
                            restaurantId: 1, 
                            status: 1, 
                            totalAmount: 1, 
                            platformFee: 1, 
                            createdAt: 1, 
                            "customer.fullName": 1, 
                            "customer.email": 1 
                        } }] 
                        : [{ $skip: skip }, { $limit: limit }]
                }
            }
        ]);

        const totalTransactions = transactionsResult[0].metadata[0]?.total || 0;
        const rawTransactions = transactionsResult[0].data || [];

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                stats: {
                    totalEarnings: result.totalEarnings,
                    successfulBookings: result.successfulBookings,
                    netPayout: netPayout
                },
                trend,
                transactions: rawTransactions.map(t => ({
                    id: t._id,
                    orderId: `#ORD-${t._id.toString().slice(-5).toUpperCase()}`,
                    date: t.createdAt,
                    customer: t.customer.fullName,
                    amount: t.totalAmount,
                    fees: t.platformFee,
                    netEarning: t.totalAmount - t.platformFee,
                    status: t.status === 'canceled' ? 'Canceled' : 'Paid'
                })),
                pagination: {
                    total: totalTransactions,
                    page,
                    limit,
                    pages: Math.ceil(totalTransactions / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

