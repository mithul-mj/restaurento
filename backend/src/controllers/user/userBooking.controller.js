import mongoose from 'mongoose';
import { Booking } from '../../models/Booking.model.js'
import { Restaurant } from '../../models/Restaurant.model.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import { TAX_RATE, PLATFORM_FEE_RATE } from '../../constants/constants.js';
import redisClient from '../../config/redis.js';
import { getRealTimeAvailability } from '../../services/inventory.service.js';

export const BookingRestaurant = async (req, res, next) => {
    try {
        const { restaurantId, bookingDate, slotTime, guests, preOrderItems } = req.body;
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
        ]);

        if (!restaurant) {
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

        // 1. Check if the date is in the past
        if (bookingDateMidnight < today) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "You cannot book for a past date."
            });
        }

        if (bookingDateMidnight.getTime() === today.getTime()) {
            const now = new Date();
            const currentMinutes = (now.getHours() * 60) + now.getMinutes();
            if (slotTime <= currentMinutes + BOOKING_BUFFER_MINUTES) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    message: `This time slot has already passed or is too soon. Please select a slot at least ${BOOKING_BUFFER_MINUTES / 60} hour from now.`
                });
            }
        }

        // Check if the restaurant is open on the requested day
        const dayOfWeek = requestedDate.getDay();
        const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
        const dayConfig = restaurant.openingHours?.days?.[dayIndex];

        if (!dayConfig || dayConfig.isClosed) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "The restaurant is closed on this day."
            });
        }

        const isValidSlot = dayConfig.generatedSlots?.some(slot => slot.startTime === parseInt(slotTime));
        if (!isValidSlot) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "The selected time slot is invalid."
            });
        }

        // Clear temporary hold and check final availability
        const holdKey = `hold:${userId}:${restaurantId}:${bookingDate}:${slotTime}:seats:${guests}`;
        await redisClient.del(holdKey);

        const trueAvailability = await getRealTimeAvailability(restaurantId, bookingDate, slotTime);

        if (trueAvailability < guests) {
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

        const booking = new Booking({
            userId,
            restaurantId,
            bookingDate,
            slotTime,
            slotEndTime,
            guests,
            totalAmount: finalTotal,
            preOrderItems: verifiedPreOrderItems,
            status: 'approved',
            paymentStatus: 'pending'
        });

        await booking.save();

        res.status(201).json({
            success: true,
            message: "Booking initiated successfully.",
            booking
        });

    } catch (error) {
        next(error);
    }
}