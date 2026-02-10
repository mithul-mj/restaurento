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
    }
}






export default restaurantService;
