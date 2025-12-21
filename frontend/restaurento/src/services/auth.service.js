import api from "./api";

const authService = {
  userLogin: async (credintials) => {
    const response = await api.post("/login", credintials);
    return response;
  },
  userSignup: async (credintials) => {
    const response = await api.post("/register", credintials);
    return response;
  },
  adminLogin: async (credintials) => {
    const response = await api.post("/admin/login", credintials);
    return response;
  },
  restaurantRegister: async (credintials) => {
    const response = await api.post("/restaurant/register", credintials);
    return response;
  },
  restaurantLogin: async (credintials) => {
    const response = await api.post("/restaurant/login", credintials);
    return response;
  },
  verifyEmail: async (data) => {
    const response = await api.post("/auth/verify-email", data);
    return response;
  },
};

export default authService;
