import redisClient from "../config/redis.js";
import { Restaurant } from "../models/Restaurant.model.js";

const getActiveHoldsForSlot = async (restaurantId, date, slotMinutes) => {
    // find all active holds using the key format: hold:userId:restaurantId:date:slotMinutes:seats:seatsCount
    const pattern = `hold:*:${restaurantId}:${date}:${slotMinutes}:seats:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;

    // total up the seats currently on hold
    const values = await redisClient.mGet(keys);
    return values.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
};

export const getOrInitSlotInventory = async (restaurantId, date, slotMinutes) => {
    // format to track available seats: seats:available:restaurantId:date:slotMinutes
    const availableKey = `seats:available:${restaurantId}:${date}:${slotMinutes}`;

    let available = await redisClient.get(availableKey);

    if (available === null) {
        const restaurant = await Restaurant.findById(restaurantId).select("totalSeats");
        if (!restaurant) throw new Error("Restaurant not found");

        const activeHolds = await getActiveHoldsForSlot(restaurantId, date, slotMinutes);
        available = Math.max(0, restaurant.totalSeats - activeHolds);

        await redisClient.setEx(availableKey, 172800, available.toString());
    }

    return parseInt(available);
};

export const getOrInitMultipleSlotsInventory = async (restaurantId, date, slotsArray) => {
    if (!slotsArray || slotsArray.length === 0) return {};

    // build redis keys for the requested time slots
    const keys = slotsArray.map(slot => `seats:available:${restaurantId}:${date}:${slot}`);

    // getting everything from redis in one go
    const redisResults = await redisClient.mGet(keys);

    // figure out which time slots weren't in the cache
    const missingIndices = [];
    redisResults.forEach((val, index) => {
        if (val === null) missingIndices.push(index);
    });

    // if there are missing slots, we only need to query the database once for the total seats
    let totalSeats = null;
    if (missingIndices.length > 0) {
        const restaurant = await Restaurant.findById(restaurantId).select("totalSeats");
        if (!restaurant) throw new Error("Restaurant not found");
        totalSeats = restaurant.totalSeats;

        // check for any active holds on these missing slots at the same time
        const holdPromises = missingIndices.map(index =>
            getActiveHoldsForSlot(restaurantId, date, slotsArray[index])
        );
        const holdsResults = await Promise.all(holdPromises);

        // pipeline the redis updates so we don't have to wait for each one individually
        const pipeline = redisClient.multi();
        missingIndices.forEach((index, i) => {
            const activeHolds = holdsResults[i];
            const available = Math.max(0, totalSeats - activeHolds);

            redisResults[index] = available.toString();
            pipeline.setEx(keys[index], 172800, available.toString());
        });

        await pipeline.exec();
    }

    // map the slots to their available seats and return them
    const availabilityMap = {};
    slotsArray.forEach((slot, index) => {
        availabilityMap[slot] = parseInt(redisResults[index]);
    });

    return availabilityMap;
};
