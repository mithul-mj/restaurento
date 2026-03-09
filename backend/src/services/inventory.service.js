import redisClient from "../config/redis.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Booking } from "../models/Booking.model.js";
import mongoose from "mongoose";

const getActiveHoldsForSlot = async (restaurantId, date, slotMinutes) => {
    // Redis key format: hold:userId:restaurantId:date:slotMinutes:seats:seatsCount
    const pattern = `hold:*:${restaurantId}:${date}:${slotMinutes}:seats:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;

    // total up the temporary seats currently held in shopping carts
    const values = await redisClient.mGet(keys);
    return values.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
};

export const getRealTimeAvailability = async (restaurantId, date, slotMinutes) => {
    const restaurant = await Restaurant.findById(restaurantId).select("totalSeats");
    if (!restaurant) throw new Error("Restaurant not found");
    const totalSeats = restaurant.totalSeats || 0;

    const searchDate = new Date(date);
    searchDate.setUTCHours(0, 0, 0, 0);
    const nextDate = new Date(searchDate);
    nextDate.setDate(searchDate.getDate() + 1);

    // Get permanent bookings for this specific slot
    const approvedBookings = await Booking.aggregate([
        {
            $match: {
                restaurantId: new mongoose.Types.ObjectId(restaurantId),
                bookingDate: { $gte: searchDate, $lt: nextDate },
                status: "approved",
                paymentStatus: { $ne: "pending" }, // Don't count pending bookings as occupied seats
                slotTime: { $lte: parseInt(slotMinutes) },
                slotEndTime: { $gt: parseInt(slotMinutes) }
            }
        },
        {
            $group: {
                _id: null,
                totalGuests: { $sum: "$guests" }
            }
        }
    ]);

    const bookedGuests = approvedBookings.length > 0 ? approvedBookings[0].totalGuests : 0;

    // Get temporary holds from Redis
    const activeHolds = await getActiveHoldsForSlot(restaurantId, date, slotMinutes);

    // Availability = Total - Permanent Bookings - Temporary Holds
    return Math.max(0, totalSeats - bookedGuests - activeHolds);
};

export const getRealTimeAvailabilityMultiple = async (restaurantId, date, slotsArray) => {
    if (!slotsArray || slotsArray.length === 0) return {};

    const availabilityMap = {};
    const promises = slotsArray.map(async (slot) => {
        try {
            availabilityMap[slot] = await getRealTimeAvailability(restaurantId, date, slot);
        } catch (error) {
            console.error(`Error calculating availability for slot ${slot}:`, error);
            availabilityMap[slot] = 0;
        }
    });

    await Promise.all(promises);
    return availabilityMap;
};
