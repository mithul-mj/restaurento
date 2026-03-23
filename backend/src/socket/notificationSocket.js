export const setupNotifications = (io) => {
    io.on("connection", (socket) => {
        socket.on("join_private_room", (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} is now listening for private notifications.`);

        })
    })
}