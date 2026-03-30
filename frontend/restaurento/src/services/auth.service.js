import api from "./api";

const authService = {
  login: async (credentials, role = "USER") => {
    const endpoints = { ADMIN: "/admin/login", RESTAURANT: "/restaurant/login", USER: "/login" };
    const response = await api.post(endpoints[role] || "/login", credentials);
    return response;
  },
  signup: async (credentials, role = "USER") => {
    const endpoint = role === "RESTAURANT" ? "/restaurant/register" : "/register";
    const response = await api.post(endpoint, credentials);
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
  refreshToken: async (role) => {
    const response = await api.post("/auth/refresh-token", { role: role?.toUpperCase() });
    return response;
  },
  logout: async (role = "USER") => {
    const endpoints = { ADMIN: "/admin/logout", RESTAURANT: "/restaurant/logout", USER: "/logout" };
    return await api.post(endpoints[role] || "/logout");
  },
  forgotPassword: async (data) => {
    const response = await api.patch("/auth/forgot-password", data);
    return response;
  },
  resetPassword: async (data) => {
    const response = await api.post("/auth/reset-password-link", data);
    return response;
  },
  googleLogin: async (googleToken, role = "USER", referralCode) => {
    const endpoint = role === "RESTAURANT" ? "/restaurant/auth/google" : "/auth/google";
    const response = await api.post(endpoint, { 
      token: googleToken,
      referralCode 
    });
    return response;
  },
};

export default authService;
