import redisClient from "../config/redis.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Schedule } from "../models/Schedule.model.js";
import { Booking } from "../models/Booking.model.js";
import mongoose from "mongoose";

const getActiveHoldsForSlot = async (restaurantId, date, slotMinutes, excludeUserId = null) => {
    // Redis key format: hold:userId:restaurantId:date:slotMinutes:seats:seatsCount
    const pattern = `hold:*:${restaurantId}:${date}:${slotMinutes}:seats:*`;
    let keys = await redisClient.keys(pattern);
    
    if (excludeUserId) {
        const excludePattern = `hold:${excludeUserId}:${restaurantId}:${date}:${slotMinutes}:seats:`;
        keys = keys.filter(key => !key.startsWith(excludePattern));
    }

    if (keys.length === 0) return 0;

    // Sum up all temporary seat holds found in Redis
    const values = await redisClient.mGet(keys);
    return values.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
};

export const getRealTimeAvailability = async (restaurantId, date, slotMinutes, excludeUserId = null) => {
    // Get the schedule applicable for the booking date
    const bookingDate = new Date(date);
    const activeSchedule = await Schedule.findOne({
        restaurantId: restaurantId,
        validFrom: { $lte: bookingDate }
    }).sort({ validFrom: -1 }).select("totalSeats");

    if (!activeSchedule) throw new Error("Restaurant schedule not found for this date");
    const totalSeats = activeSchedule.totalSeats || 0;

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
                status: { $in: ["approved", "checked-in"] },
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
    const activeHolds = await getActiveHoldsForSlot(restaurantId, date, slotMinutes, excludeUserId);

    // Total available = Restaurant Capacity - Confirmed Bookings - Current Holds
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
