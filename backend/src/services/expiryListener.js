import { redisClient, redisSubscriber } from "../config/redis.js";
export const initExpiryListener = (io) => {
    const expiredChannel = "__keyevent@0__:expired";
    redisSubscriber.subscribe(expiredChannel, async (expiredKey) => {
        if (expiredKey.startsWith("hold:")) {
            const parts = expiredKey.split(":");
            const restaurantId = parts[2];
            const date = parts[3];
            const slotMinutes = parts[4];
            const count = parseInt(parts[6]);

            const availableKey = `seats:available:${restaurantId}:${date}:${slotMinutes}`;
            const newTotal = await redisClient.incrBy(availableKey, count);

            io.to(`res_${restaurantId}_${date}`).emit("slot_update", {
                slotMinutes,
                available: newTotal
            });
            console.log(`[Auto-Release] ${count} seats returned for ${date} at ${slotMinutes}m`);
        }
    });
};
