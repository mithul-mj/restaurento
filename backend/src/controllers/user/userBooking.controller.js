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
        ])

        if (!restaurant) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false, message: "Restaurant not found. "
            })
        }

        // --- THE DYNAMIC AVAILABILITY CHECK ---
        const holdKey = `hold:${userId}:${restaurantId}:${bookingDate}:${slotTime}:seats:${guests}`;

        // 1. Immediately delete their specific temporary Redis hold assuming they are verifying
        await redisClient.del(holdKey);

        // 2. Poll the absolute true availability without their own hold clogging the math
        const trueAvailability = await getRealTimeAvailability(restaurantId, bookingDate, slotTime);

        // 3. Prevent overbooking!
        if (trueAvailability < guests) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false, message: "Sorry, this slot no longer has enough seats available!"
            })
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
        })

        await booking.save();

        res.status(201).json({
            success: true,
            message: "Booking request sent successfully",
            booking
        })

    } catch (error) {
        next(error)
    }
}