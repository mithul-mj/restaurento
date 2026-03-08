import { redisSubscriber } from "../config/redis.js";
import { getRealTimeAvailability } from "./inventory.service.js"; // Import new dynamic fetch

export const initExpiryListener = (io) => {
    const expiredChannel = "__keyevent@0__:expired";
    redisSubscriber.subscribe(expiredChannel, async (expiredKey) => {
        if (expiredKey.startsWith("hold:")) {
            const parts = expiredKey.split(":");
            const restaurantId = parts[2];
            const date = parts[3];
            const slotMinutes = parts[4];
            const count = parseInt(parts[6]);

            // Calculate the true, fresh current availability without the old Redis availability key
            const newTotal = await getRealTimeAvailability(restaurantId, date, slotMinutes);

            io.to(`res_${restaurantId}_${date}`).emit("slot_update", {
                slotMinutes,
                available: newTotal
            });
            console.log(`[Auto-Release] ${count} temporary seats freed up for ${date} at ${slotMinutes}m`);
        }
    });
};
