import api from "./api";

const restaurantService = {
    onboard: async (formData) => {
        const response = await api.post("/restaurant/onboarding", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response;
    },


};

export default restaurantService;
