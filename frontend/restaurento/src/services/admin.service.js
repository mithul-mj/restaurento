import api from "./api";

const adminService = {
  fetchUsers: async ({ page, limit, search, sortBy, status }) => {
    const response = await api.get("admin/users", {
      params: { page, limit, search, sortBy, status },
    });
    return response.data;
  },
  toggleUserStatus: async (userId) => {
    const response = await api.patch(`admin/users/${userId}/toggle-status`);
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
  restaurantVerificationStatus: async (restaurantId) => {
    const response = await api.patch(
      `admin/restaurants/${restaurantId}/verification-status`,
    );
    return response;
  },
};

export default adminService;
