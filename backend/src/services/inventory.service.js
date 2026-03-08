import redisClient from "../config/redis.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Booking } from "../models/Booking.model.js";
import mongoose from "mongoose";

const getActiveHoldsForSlot = async (restaurantId, date, slotMinutes) => {
    // 10-minute temporary holds key format string: hold:userId:restaurantId:date:slotMinutes:seats:seatsCount
    const pattern = `hold:*:${restaurantId}:${date}:${slotMinutes}:seats:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;

    // total up the temporary seats currently held in shopping carts
    const values = await redisClient.mGet(keys);
    return values.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
};

export const getRealTimeAvailability = async (restaurantId, date, slotMinutes) => {
    // 1. Get total seats for restaurant
    const restaurant = await Restaurant.findById(restaurantId).select("totalSeats");
    if (!restaurant) throw new Error("Restaurant not found");
    const totalSeats = restaurant.totalSeats || 0;

    const searchDate = new Date(date);
    searchDate.setUTCHours(0, 0, 0, 0);
    const nextDate = new Date(searchDate);
    nextDate.setDate(searchDate.getDate() + 1);

    // 2. Query MongoDB for highly-accurate permanent bookings that overlap this specific minute!
    const approvedBookings = await Booking.aggregate([
        {
            $match: {
                restaurantId: new mongoose.Types.ObjectId(restaurantId),
                bookingDate: { $gte: searchDate, $lt: nextDate },
                status: "approved",
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

    // 3. Query Redis for any unconfirmed temporary holds (users sitting on checkout page)
    const activeHolds = await getActiveHoldsForSlot(restaurantId, date, slotMinutes);

    // 4. Crunch the numbers: Total - Permanent Bookings - Temporary Holds
    const available = Math.max(0, totalSeats - bookedGuests - activeHolds);

    return available;
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
