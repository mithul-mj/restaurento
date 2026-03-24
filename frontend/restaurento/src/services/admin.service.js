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

  fetchPayments: async ({ page, limit, search, date }) => {
    const response = await api.get("/admin/payments/dashboard", {
      params: { page, limit, search, date },
    });
    return response.data;
  },

  fetchTransactionDetails: async (transactionId) => {
    const response = await api.get(`/admin/payments/transactions/${transactionId}`);
    return response.data;
  },

  getDashboardStats: async (timeframe) => {
    const response = await api.get("/admin/dashboard/stats", {
      params: { timeframe },
    });
    return response.data;
  },
};



export default adminService;
