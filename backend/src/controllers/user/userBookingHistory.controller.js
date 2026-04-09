import mongoose from 'mongoose';
import { Booking } from '../../models/Booking.model.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_LIMIT } from '../../constants/constants.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages.js';

export const getMyBookings = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { type = 'upcoming', page = DEFAULT_PAGE_NUMBER, limit = DEFAULT_PAGE_LIMIT } = req.query;

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
                    slotEndTime: { $gte: currentMinutes }
                }
            ];
        } else if (type === 'canceled') {
            matchQuery.status = 'canceled';
        } else if (type === 'pending') {
            matchQuery.status = 'pending-payment';
        } else {
            // Past
            matchQuery.$or = [
                { status: 'checked-in' },
                {
                    status: 'approved',
                    $or: [
                        { bookingDate: { $lt: today } },
                        {
                            bookingDate: { $eq: today },
                            slotEndTime: { $lt: currentMinutes }
                        }
                    ]
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
                                let: { rid: '$restaurantId' },
                                pipeline: [
                                    { $match: { $expr: { $eq: ['$_id', '$$rid'] } } },
                                    {
                                        $project: {
                                            _id: 1,
                                            restaurantName: 1,
                                            images: { $slice: ['$images', 1] }
                                        }
                                    }
                                ],
                                as: 'restaurant'
                            }
                        },
                        { $unwind: '$restaurant' },
                        {
                            $project: {
                                _id: 1,
                                bookingDate: 1,
                                slotTime: 1,
                                guests: 1,
                                status: 1,
                                canceledBy: 1,
                                totalAmount: 1,
                                razorpayOrderId: 1,
                                walletAmountUsed: 1,
                                preOrderItems: 1,
                                restaurantId: 1,
                                restaurant: 1
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
                $addFields: {
                    checkInToken: { 
                        $cond: { 
                            if: { $eq: ["$status", "approved"] }, 
                            then: "$checkInToken", 
                            else: "$$REMOVE" 
                        } 
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
                message: ERROR_MESSAGES.BOOKING_NOT_FOUND
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
