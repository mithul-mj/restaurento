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
  getDashboard: async (page = 1, limit = 6, search = "", filters = {}, coordinates = null, activeFilter = null) => {
    let params = { page, limit, search, ...filters };

    if (activeFilter === "Open Now") {
      params.openNow = true;
    }

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
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },
  getRestaurantMenu: async (id, page = 1, category = "All", search = "", limit = 6) => {
    const response = await api.get(`/restaurants/${id}/menu`, {
      params: { page, category, search, limit }
    });
    return response.data;
  },
  getActiveBanners: async () => {
    const response = await api.get("/banners");
    return response.data;
  }

};

export default userService;
