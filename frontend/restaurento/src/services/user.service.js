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
  },
  addToWishlist: async (data) => {
    const response = await api.post("/wishlist", data);
    return response.data;
  },
  getWishlists: async (page = 1, limit = 4) => {
    const response = await api.get("/wishlist", {
      params: { page, limit }
    });
    return response.data;
  },
  removeFromWishlist: async (id) => {
    const response = await api.delete(`/wishlist/${id}`);
    return response.data;
  },
  createBooking: async (bookingData) => {
    const response = await api.post("/booking", bookingData);
    return response.data
  },
  verifyRazorpayPayment: async (paymentData) => {
    const response = await api.post("/payments/verify", paymentData);
    return response.data;
  },
  getMyBookings: async ({ type, page, limit }) => {
    const response = await api.get("/bookings", {
      params: { type, page, limit }
    });
    return response.data;
  },
  checkBookingAvailability: async (id) => {
    const response = await api.get(`/bookings/${id}/check-availability`);
    return response.data;
  },
  getBookingDetails: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },
  cancelBooking: async (bookingId) => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },
  getMyWalletHistory: async (page = 1, limit = 3) => {
    const response = await api.get('/wallet', {
      params: { page, limit }
    })
    return response.data
  },
  getWalletBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },
  getAvailableCoupons: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },
  getTopRestaurants: async () => {
    const response = await api.get('/top-restaurants');
    return response.data;
  },
  submitReview: async (data) => {
    const response = await api.post("/reviews/submit", data);
    return response.data;
  },
  getExistingReview: async (restaurantId) => {
    const response = await api.get(`/reviews/${restaurantId}`);
    return response.data;
  },
  getRestaurantReviews: async (id, page = 1, limit = 5) => {
    const response = await api.get(`/reviews/${id}/all`, {
      params: { page, limit }
    });
    return response.data;
  },
};

export default userService;
