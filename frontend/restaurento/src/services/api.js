import axios from "axios";
import { store } from "../redux/store.js";
import { logout } from "../redux/slices/authSlice";
import authService from "./auth.service.js";
import STATUS_CODES from "../constants/statusCodes.js";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    // These headers help bypass automated warning screens from tunneling services (like ngrok, devtunnels, etc)
    // which otherwise break JSON parsing with an HTML response.
    "ngrok-skip-browser-warning": "69420",
    "bypass-tunnel-reminder": "true",
    "X-DevTunnel-Skip": "true"
  }
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === STATUS_CODES.UNAUTHORIZED &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/register") &&
      !originalRequest.url.includes("/auth/reset-password-link")
    ) {
      originalRequest._retry = true;
      try {
        let role = "USER";
        if (originalRequest.url.includes("admin")) role = "ADMIN";
        else if (originalRequest.url.includes("restaurant")) role = "RESTAURANT";

        console.log(`Refreshing token for role: ${role} based on URL: ${originalRequest.url}`);

        await authService.refreshToken(role);

        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
