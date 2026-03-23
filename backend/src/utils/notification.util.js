import { Notification } from '../models/Notification.model.js'
import ROLES from '../constants/roles.js';

export const sendNotification = async (req, { recipientId, title, message }) => {
    try {
        const notification = await Notification.create({
            recipientId,
            recipientModel: ROLES.USER,
            title,
            message,
            isRead: false
        });

        const io = req.app.get("io");
        if (io) {
            io.to(`user_${recipientId}`).emit("new_notification", notification);
            console.log(`Live notification sent to user_${recipientId}`);
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}
