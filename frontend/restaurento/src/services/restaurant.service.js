import api from "./api";

const restaurantService = {
    onboard: async (formData) => {
        const response = await api.post("/restaurant/complete-onboarding", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    preApproval: async (formData) => {
        const response = await api.post("/restaurant/pre-approval", formData);
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get("/restaurant/profile");
        return response.data;
    },
    updateSettings: async (data) => {
        const response = await api.patch("/restaurant/settings", data);
        return response.data;
    },
    updateProfile: async (formData) => {
        const response = await api.patch("/restaurant/profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    getMenu: async ({ page, limit, category, search }) => {
        const response = await api.get("/restaurant/menu", {
            params: { page, limit, category, search },

        })
        return response.data;
    },
    toggleItemAvailability: async (itemId) => {
        const response = await api.patch(`/restaurant/menu/${itemId}/toggle-availability`)
        return response.data
    },
    addMenuItem: async (data) => {
        const response = await api.post("/restaurant/menu", data);
        return response.data;
    },
    updateMenuItem: async (itemId, data) => {
        const response = await api.patch(`/restaurant/menu/${itemId}`, data);
        return response.data;
    },
    deleteMenuItem: async (itemId) => {
        const response = await api.delete(`/restaurant/menu/${itemId}`);
        return response.data;
    },
    verifyCheckIn: async (token) => {
        const response = await api.post("/restaurant/bookings/verify-checkin", { token });
        return response.data;
    },
    getBookings: async ({ page, limit, status, search }) => {
        const response = await api.get("/restaurant/bookings", {
            params: { page, limit, status, search }
        });
        return response.data;
    },
    getBookingDetails: async (bookingId) => {
        const response = await api.get(`/restaurant/bookings/${bookingId}`);
        return response.data;
    },
    updateBookingStatus: async (bookingId, status) => {
        const response = await api.patch(`/restaurant/bookings/${bookingId}/status`, { status });
        return response.data;
    },
    getDashboardStats: async (dateFilter) => {
        const response = await api.get("/restaurant/stats", {
            params: { dateFilter }
        });
        return response.data;
    },
    getEarnings: async ({ page, limit, status, search, date, startDate, endDate }) => {
        const response = await api.get("/restaurant/earnings", {
            params: { page, limit, status, search, date, startDate, endDate }
        });
        return response.data;
    }
}

export default restaurantService;
