import { RESERVE_SLOT_LUA } from "../utils/redisScripts.js";
import { getOrInitSlotInventory } from "../services/inventory.service.js";
import redisClient from "../config/redis.js";

export const setupReservation = (io) => {
    io.on("connection", (socket) => {
        socket.on("view_date_slots", ({ restaurantId, date }) => {
            socket.join(`res_${restaurantId}_${date}`);
        });

        socket.on("reserve_seats", async ({ restaurantId, date, slotMinutes, seats, userId }) => {
            const availableKey = `seats:available:${restaurantId}:${date}:${slotMinutes}`;
            const holdKey = `hold:${userId}:${restaurantId}:${date}:${slotMinutes}:seats:${seats}`;

            try {
                await getOrInitSlotInventory(restaurantId, date, slotMinutes);

                const [status, result] = await redisClient.eval(
                    RESERVE_SLOT_LUA,
                    {
                        keys: [availableKey, holdKey],
                        arguments: [seats.toString(), "600"]
                    }
                );

                if (status === 1) {
                    io.to(`res_${restaurantId}_${date}`).emit("slot_update", {
                        slotMinutes,
                        available: result
                    });
                    socket.emit("reserve_success", { seats, slotMinutes });
                } else if (status === 0) {
                    socket.emit("reserve_fail", { message: "Not enough seats in this slot" });
                }
            } catch (err) {
                console.error("Booking Error:", err);
                socket.emit("reserve_error", { message: "Internal Server Error" });
            }
        });

        // Cleanup: return seats if disconnected (Optional, relies on hold key expiry)
        socket.on("disconnect", () => { });
    });
};
