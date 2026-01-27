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


};



export default restaurantService;
