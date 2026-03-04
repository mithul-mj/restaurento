import { RESERVE_SLOT_LUA } from "../utils/redisScripts.js";
import { getOrInitSlotInventory, getOrInitMultipleSlotsInventory } from "../services/inventory.service.js";
import redisClient from "../config/redis.js";

export const setupReservation = (io) => {
    io.on("connection", (socket) => {
        socket.on("view_date_slots", ({ restaurantId, date }) => {
            socket.join(`res_${restaurantId}_${date}`);
        });

        socket.on("check_availability", async ({ restaurantId, date, slots }) => {
            try {
                if (!slots || !Array.isArray(slots)) return;
                const availabilityMap = await getOrInitMultipleSlotsInventory(restaurantId, date, slots);
                socket.emit("initial_availability", availabilityMap);
            } catch (err) {
                console.error("Check Availability Error:", err);
            }
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

        socket.on("release_hold", async ({ restaurantId, date, slotMinutes, seats, userId }) => {
            const availableKey = `seats:available:${restaurantId}:${date}:${slotMinutes}`;
            const holdKey = `hold:${userId}:${restaurantId}:${date}:${slotMinutes}:seats:${seats}`;

            try {
                // if the user has seats held, release them back to the available pool
                const holdExists = await redisClient.exists(holdKey);

                if (holdExists) {
                    await redisClient.del(holdKey);
                    const newTotal = await redisClient.incrBy(availableKey, seats);

                    io.to(`res_${restaurantId}_${date}`).emit("slot_update", {
                        slotMinutes,
                        available: newTotal
                    });
                }
            } catch (err) {
                console.error("Release Hold Error:", err);
            }
        });

        // no extra cleanup needed on disconnect since redis holds expire automatically
        socket.on("disconnect", () => { });
    });
};
