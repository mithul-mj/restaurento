import api from "./api";

const userService = {
  getProfile: async () => {
    const response = await api.get("/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put("/profile", data);
    return response.data;
  },
  requestEmailChange: async (email) => {
    const response = await api.patch("/profile/change-email/request", { email });
    return response.data;
  },
  verifyEmailChange: async (newEmail, otp) => {
    const response = await api.patch("/profile/change-email/verify", { newEmail, otp });
    return response.data;
  },
  getDashboard: async (page = 1, limit = 6, search = "", filters = {}, coordinates = null) => {
    let params = { page, limit, search, ...filters };

    if (coordinates && coordinates.lat && coordinates.lon) {
      params.lat = coordinates.lat;
      params.lng = coordinates.lon;
    }

    const response = await api.get(`/dashboard`, {
      params,
    });
    return response.data;
  },
  getRestaurantDetails: async (id) => {
    const response = await api.get(`/restaurant/${id}`);
    return response.data;
  },
  getRestaurantMenu: async (id, page = 1, category = "All", search = "") => {
    const response = await api.get(`/restaurant/${id}/menu`, {
      params: { page, category, search }
    });
    return response.data;
  },
};

export default userService;
