import { Notification } from '../../models/Notification.model.js'
import STATUS_CODES from '../../constants/statusCodes.js'

export const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;

        const [notifications, totalCount] = await Promise.all([
            Notification.find({ recipientId: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ recipientId: req.user._id })
        ]);


        res.status(STATUS_CODES.OK).json({
            success: true,
            notifications,
            meta: {
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error fetching notifications"
        });
    }
}

export const getUnreadCount = async (req, res) => {
    const count = await Notification.countDocuments({
        recipientId: req.user._id,
        isRead: false
    })
    res.status(STATUS_CODES.OK).json({
        success: true,
        count
    })
}

export const markOneAsRead = async (req, res) => {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
        { _id: id, recipientId: req.user._id },
        { $set: { isRead: true } }
    );
    res.status(STATUS_CODES.OK).json({
        success: true,
        message: "Notification marked as read"
    });
}

export const markAllAsRead = async (req, res) => {

    await Notification.updateMany(
        { recipientId: req.user._id, isRead: false },
        { $set: { isRead: true } }
    )
    res.status(STATUS_CODES.OK).json({
        success: true,
        message: "All marked as read"
    })
}
