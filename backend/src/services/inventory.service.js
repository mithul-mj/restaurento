import redisClient from "../config/redis.js";
import { Restaurant } from "../models/Restaurant.model.js";

export const getOrInitSlotInventory = async (restaurantId, date, slotMinutes) => {
    // Unique key: seats:available:REST_ID:2024-05-10:840
    const availableKey = `seats:available:${restaurantId}:${date}:${slotMinutes}`;

    let available = await redisClient.get(availableKey);

    if (available === null) {
        const restaurant = await Restaurant.findById(restaurantId).select("totalSeats");
        if (!restaurant) throw new Error("Restaurant not found");

        available = restaurant.totalSeats;

        // Cache in Redis for 48 hours (to cover multi-day booking windows)
        await redisClient.setEx(availableKey, 172800, available.toString());
    }

    return parseInt(available);
};
