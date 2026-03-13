import mongoose from 'mongoose';
import { Booking } from '../../models/Booking.model.js'
import { WalletTransaction } from '../../models/WalletTransaction.model.js'
import { User } from '../../models/User.model.js'
import { Restaurant } from '../../models/Restaurant.model.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import { TAX_RATE, PLATFORM_FEE_RATE, BOOKING_BUFFER_MINUTES } from '../../constants/constants.js';
import redisClient from '../../config/redis.js';
import { getRealTimeAvailability } from '../../services/inventory.service.js';
import ROLES from '../../constants/roles.js';

export const BookingRestaurant = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { restaurantId, bookingDate, slotTime, guests, preOrderItems, useWallet } = req.body;
        const userId = req.user._id;

        const requestedDishIds = (preOrderItems || []).map(
            item => new mongoose.Types.ObjectId(item.dishId)
        );

        const [restaurant] = await Restaurant.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(restaurantId) }
            },
            {
                $project: {
                    restaurantName: 1, // Added for wallet description
                    slotPrice: 1,
                    slotConfig: 1,
                    openingHours: 1,
                    menuItems: {
                        $filter: {
                            input: "$menuItems",
                            as: "item",
                            cond: {
                                $in: ["$$item._id", requestedDishIds]
                            }
                        }
                    }
                }
            }
        ]).session(session);

        if (!restaurant) {
            await session.abortTransaction();
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: "Restaurant not found."
            });
        }

        // Validate booking date and time
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const requestedDate = new Date(bookingDate);
        const bookingDateMidnight = new Date(requestedDate);
        bookingDateMidnight.setUTCHours(0, 0, 0, 0);

        if (bookingDateMidnight < today) {
            await session.abortTransaction();
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "You cannot book for a past date."
            });
        }

        if (bookingDateMidnight.getTime() === today.getTime()) {
            const now = new Date();
            const currentMinutes = (now.getHours() * 60) + now.getMinutes();
            if (slotTime <= currentMinutes + BOOKING_BUFFER_MINUTES) {
                await session.abortTransaction();
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    message: `This time slot has already passed or is too soon. Please select a slot at least ${BOOKING_BUFFER_MINUTES / 60} hour from now.`
                });
            }
        }

        const dayOfWeek = requestedDate.getDay();
        const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
        const dayConfig = restaurant.openingHours?.days?.[dayIndex];

        if (!dayConfig || dayConfig.isClosed) {
            await session.abortTransaction();
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "The restaurant is closed on this day."
            });
        }

        const isValidSlot = dayConfig.generatedSlots?.some(slot => slot.startTime === parseInt(slotTime));
        if (!isValidSlot) {
            await session.abortTransaction();
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "The selected time slot is invalid."
            });
        }

        const holdKey = `hold:${userId}:${restaurantId}:${bookingDate}:${slotTime}:seats:${guests}`;
        await redisClient.del(holdKey);

        const trueAvailability = await getRealTimeAvailability(restaurantId, bookingDate, slotTime);

        if (trueAvailability < guests) {
            await session.abortTransaction();
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "Enough seats are no longer available for this slot."
            });
        }

        const pricePerPerson = restaurant.slotPrice || 0;
        const bookingFee = pricePerPerson * guests;

        let itemTotal = 0;
        const verifiedPreOrderItems = [];

        if (preOrderItems && preOrderItems.length > 0) {
            for (const item of preOrderItems) {
                const dbDish = restaurant.menuItems.find(
                    (menuItem) => menuItem._id.toString() === item.dishId
                )
                if (dbDish) {
                    itemTotal += (dbDish.price * item.qty);
                    verifiedPreOrderItems.push({
                        dishId: dbDish._id,
                        name: dbDish.name,
                        qty: item.qty,
                        priceAtBooking: dbDish.price
                    })
                }
            }
        }

        const subtotal = bookingFee + itemTotal;
        const tax = itemTotal * TAX_RATE;
        const platformFee = subtotal * PLATFORM_FEE_RATE;
        const finalTotal = subtotal + tax + platformFee;

        const duration = restaurant.slotConfig?.duration || 60;
        const slotEndTime = slotTime + duration;

        // --- Wallet Logic ---
        let walletAmountUsed = 0;
        let paymentStatus = 'pending';

        if (useWallet) {
            const user = await User.findById(userId).session(session);
            if (user && user.walletBalance > 0) {
                walletAmountUsed = Math.min(user.walletBalance, finalTotal);

                // If FULL wallet payment, deduct now
                if (walletAmountUsed === finalTotal) {
                    user.walletBalance -= walletAmountUsed;
                    await user.save({ session });
                    paymentStatus = 'paid';
                }
            }
        }

        const booking = new Booking({
            userId,
            restaurantId,
            bookingDate,
            slotTime,
            slotEndTime,
            guests,
            totalAmount: finalTotal,
            slotPrice: pricePerPerson,
            tax,
            platformFee,
            preOrderItems: verifiedPreOrderItems,
            status: 'approved',
            paymentStatus: paymentStatus,
            walletAmountUsed: walletAmountUsed // Store intent for partial payments
        });

        // Create transaction log only for FULL wallet payments
        if (paymentStatus === 'paid' && walletAmountUsed > 0) {
            const walletTx = await WalletTransaction.create([{
                userId,
                bookingId: booking._id,
                amount: -walletAmountUsed, // Negative for debit
                description: `Used wallet for booking at ${restaurant.restaurantName}`
            }], { session });

            // Link the wallet transaction ID to the booking
            booking.walletTransactionId = walletTx[0]._id;
        }

        await booking.save({ session });

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: walletAmountUsed === finalTotal ? "Booking successful using wallet." : "Booking initiated successfully.",
            booking,
            remainingAmount: finalTotal - walletAmountUsed
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
}


export const getMyBookings = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { type = 'upcoming', page = 1, limit = 3 } = req.query;

        const now = new Date();
        const today = new Date(now);
        today.setUTCHours(0, 0, 0, 0);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let matchQuery = { userId: new mongoose.Types.ObjectId(userId) };

        if (type === 'upcoming') {
            matchQuery.status = 'approved';
            matchQuery.$or = [
                { bookingDate: { $gt: today } },
                {
                    bookingDate: { $eq: today },
                    slotTime: { $gte: currentMinutes }
                }
            ];
        } else if (type === 'canceled') {
            matchQuery.status = 'canceled';
        } else {
            // Past
            matchQuery.status = 'approved';
            matchQuery.$or = [
                { bookingDate: { $lt: today } },
                {
                    bookingDate: { $eq: today },
                    slotTime: { $lt: currentMinutes }
                }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = type === 'upcoming' ? 1 : -1;

        const result = await Booking.aggregate([
            { $match: { ...matchQuery } },
            { $sort: { bookingDate: sortOrder, slotTime: sortOrder } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skip },
                        { $limit: parseInt(limit) },
                        {
                            $lookup: {
                                from: 'restaurants',
                                localField: 'restaurantId',
                                foreignField: '_id',
                                as: 'restaurant'
                            }
                        },
                        { $unwind: '$restaurant' },
                        {
                            $addFields: {
                                restaurant: {
                                    _id: '$restaurant._id',
                                    restaurantName: '$restaurant.restaurantName',
                                    address: '$restaurant.address',
                                    images: { $slice: ["$restaurant.images", 1] }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const bookings = result[0].data || [];
        const totalCount = result[0].metadata[0]?.total || 0;

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: bookings,
            meta: {
                totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getBookingDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const bookings = await Booking.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurantId",
                    foreignField: "_id",
                    as: "restaurant"
                }
            },
            { $unwind: "$restaurant" },
            {
                $addFields: {
                    restaurant: {
                        _id: "$restaurant._id",
                        restaurantName: "$restaurant.restaurantName",
                        address: "$restaurant.address",
                        restaurantPhone: "$restaurant.restaurantPhone",
                        email: "$restaurant.email",
                        location: "$restaurant.location",
                        slotPrice: "$restaurant.slotPrice",
                        images: { $slice: ["$restaurant.images", 1] }
                    }
                }
            },
            {
                $project: {
                    restaurantId: 0,
                    userId: 0,
                    __v: 0
                }
            }
        ]);

        if (!bookings.length) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: "Booking not found."
            });
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: bookings[0]
        });
    } catch (error) {
        next(error);
    }
};

export const cancelBooking = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { id } = req.params;
        const userId = req.user._id;

        // Perform lookup inside session for transactional safety
        const booking = await Booking.findOne({ _id: id, userId })
            .populate('restaurantId', 'restaurantName')
            .session(session);

        if (!booking) {
            await session.abortTransaction();
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                message: "Booking not found."
            });
        }

        if (booking.status === 'canceled') {
            await session.abortTransaction();
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "Booking is already canceled."
            });
        }

        // Check if it's already in the past
        const now = new Date();
        const today = new Date(now);
        today.setUTCHours(0, 0, 0, 0);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        if (booking.bookingDate < today || (booking.bookingDate.getTime() === today.getTime() && booking.slotTime < currentMinutes)) {
            await session.abortTransaction();
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "Cannot cancel a past booking."
            });
        }

        // 1. Mark booking as canceled and refunded
        booking.status = 'canceled';
        booking.paymentStatus = 'refunded';
        booking.canceledBy = ROLES.USER;
        await booking.save({ session });

        // 2. Refund to wallet
        await User.findByIdAndUpdate(
            userId,
            { $inc: { walletBalance: booking.totalAmount } },
            { session }
        );

        // 3. Create wallet transaction log
        await WalletTransaction.create([{
            userId,
            bookingId: booking._id,
            amount: booking.totalAmount, // Positive value represents a credit/refund
            description: `Refund for cancelled booking at ${booking.restaurantId.restaurantName}`
        }], { session });

        // Commit all changes
        await session.commitTransaction();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: "Booking canceled successfully and amount refunded to wallet.",
            booking
        });

    } catch (error) {
        // Only abort if the transaction hasn't been committed/aborted already
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
};
