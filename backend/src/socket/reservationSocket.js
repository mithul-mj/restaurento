import { getRealTimeAvailability, getRealTimeAvailabilityMultiple } from "../services/inventory.service.js";
import redisClient from "../config/redis.js";
import { INITIAL_HOLD_TIME_SECONDS } from "../constants/constants.js";

export const setupReservation = (io) => {
    io.on("connection", (socket) => {
        socket.on("view_date_slots", ({ restaurantId, date }) => {
            socket.join(`res_${restaurantId}_${date}`);
        });

        socket.on("check_availability", async ({ restaurantId, date, slots }) => {
            try {
                if (!slots || !Array.isArray(slots)) return;
                const availabilityMap = await getRealTimeAvailabilityMultiple(restaurantId, date, slots);
                socket.emit("initial_availability", availabilityMap);
            } catch (err) {
                console.error("Check Availability Error:", err);
            }
        });

        socket.on("reserve_seats", async ({ restaurantId, date, slotMinutes, seats, userId, guests }) => {
            const dStr = new Date(date);
            const formattedDate = `${dStr.getUTCFullYear()}-${String(dStr.getUTCMonth() + 1).padStart(2, '0')}-${String(dStr.getUTCDate()).padStart(2, '0')}`;
            const holdKey = `hold:${userId}:${restaurantId}:${formattedDate}:${slotMinutes}:seats:${seats}`;

            try {
                // Determine true organic availability from MongoDB & Redis combined
                const available = await getRealTimeAvailability(restaurantId, date, slotMinutes);

                if (available >= seats) {
                    // Lock in the temporary hold for initial period specifically for this user
                    await redisClient.setEx(holdKey, INITIAL_HOLD_TIME_SECONDS, seats.toString());

                    // Tell all users viewing this date that availability has dynamically changed
                    const newAvailable = available - seats;
                    io.to(`res_${restaurantId}_${date}`).emit("slot_update", {
                        slotMinutes,
                        available: newAvailable
                    });

                    socket.emit("reserve_success", { seats, slotMinutes });
                } else {
                    socket.emit("reserve_fail", { message: "Not enough seats in this slot" });
                }
            } catch (err) {
                console.error("Booking Error:", err);
                socket.emit("reserve_error", { message: "Internal Server Error" });
            }
        });

        socket.on("release_hold", async ({ restaurantId, date, slotMinutes, seats, userId }) => {
            const dStr = new Date(date);
            const formattedDate = `${dStr.getUTCFullYear()}-${String(dStr.getUTCMonth() + 1).padStart(2, '0')}-${String(dStr.getUTCDate()).padStart(2, '0')}`;
            const holdKey = `hold:${userId}:${restaurantId}:${formattedDate}:${slotMinutes}:seats:${seats}`;

            try {
                // If the user navigates away, clear their temporary hold early
                const holdExists = await redisClient.exists(holdKey);

                if (holdExists) {
                    await redisClient.del(holdKey);

                    // Recalculate and broadcast the freshly freed up availability
                    const newAvailable = await getRealTimeAvailability(restaurantId, date, slotMinutes);
                    io.to(`res_${restaurantId}_${date}`).emit("slot_update", {
                        slotMinutes,
                        available: newAvailable
                    });
                }
            } catch (err) {
                console.error("Release Hold Error:", err);
            }
        });

        socket.on("disconnect", () => { });
    });
};
