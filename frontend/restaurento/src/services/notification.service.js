import api from "./api";

const notificationService = {
    getNotifications: async (page = 1, limit = 2) => {
        const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
        return response.data;
    },


    getUnreadCount: async () => {
        const response = await api.get("/notifications/unread-count");
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.patch("/notifications/mark-all-read");
        return response.data;
    },

    markOneAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/mark-read`);
        return response.data;
    }

};

export default notificationService;
