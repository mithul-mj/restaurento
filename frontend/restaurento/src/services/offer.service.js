import api from "./api";

export const offerService = {
  getMyOffers: async (params = {}) => {
    const response = await api.get("/restaurant/offers", {
      params: {
        ...params,
        // Filter out the UI labels so the backend doesn't receive them
        status: params.status === "All Status" ? undefined : params.status,
        sortBy: params.sortBy === "Sort By" ? undefined : params.sortBy,
      }
    });
    return response.data;
  },

  createOffer: async (offerData) => {
    const response = await api.post("/restaurant/offers", offerData);
    return response.data;
  },

  updateOffer: async (id, offerData) => {
    const response = await api.patch(`/restaurant/offers/${id}`, offerData);
    return response.data;
  },

  toggleOffer: async (id) => {
    const response = await api.patch(`/restaurant/offers/${id}/toggle`);
    return response.data;
  },

  deleteOffer: async (id) => {
    const response = await api.delete(`/restaurant/offers/${id}`);
    return response.data;
  }
};

export default offerService;
