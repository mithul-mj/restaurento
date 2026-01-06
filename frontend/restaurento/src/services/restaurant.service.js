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


};

export default restaurantService;
