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
  resendOtp: async (data) => {
    const response = await api.post("/auth/resend-otp", data);
    return response;
  },
  refreshToken: async () => {
    const response = await api.post("/auth/refresh-token");
    return response;
  },
  logout: async () => {
    const response = await api.post("/logout");
    return response;
  },
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password");
    return response;
  },
  resetPasword: async (data) => {
    const response = await api.post("/auth/reset/password");
    return response;
  },
  googleLogin: async (googleToken, role = 'USER') => {
    if (role === 'RESTAURANT') {
      const response = await api.post("/restaurant/auth/google", { token: googleToken });
      return response;
    } else {
      const response = await api.post("/auth/google", { token: googleToken });
      return response;
    }
  },
};

export default authService;
