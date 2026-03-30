import { Notification } from '../models/Notification.model.js'
import ROLES from '../constants/roles.js';

export const sendNotification = async (req, { recipientId, title, message, type = "SYSTEM", link = "", recipientModel = ROLES.USER }) => {
    try {
        const notification = await Notification.create({
            recipientId,
            recipientModel,
            title,
            message,
            type,
            link,
            isRead: false
        });

        const io = req.app.get("io");
        if (io) {
            const room = recipientModel === ROLES.USER ? `user_${recipientId}` : `restaurant_${recipientId}`;
            io.to(room).emit("new_notification", notification);
            console.log(`Live notification sent to ${room}`);
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}
