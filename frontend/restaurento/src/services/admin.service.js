import api from "./api";

const adminService = {
  fetchUsers: async ({ page, limit, search, sortBy, status }) => {
    const response = await api.get("/admin/users", {
      params: { page, limit, search, sortBy, status },
    });
    return response.data;
  },
  toggleUserStatus: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  fetchRestaurants: async ({ page, limit, search, sortBy, status }) => {
    const response = await api.get("/admin/restaurants", {
      params: { page, limit, search, sortBy, status },
    });
    return response.data;
  },
  toggleRestaurantStatus: async (restaurantId) => {
    const response = await api.patch(
      `admin/restaurants/${restaurantId}/toggle-status`,
    );
    return response;
  },
  toggleRestaurantVerificationStatus: async (restaurantId, data) => {
    const response = await api.patch(
      `admin/restaurants/${restaurantId}/verification-status`,
      data
    );
    return response.data;
  },
  getRestaurantDetails: async (restaurantId) => {
    const response = await api.get(`/admin/restaurants/${restaurantId}`);
    return response.data;
  },
};


export default adminService;
