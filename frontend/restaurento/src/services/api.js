import axios from "axios";
import { store } from "../redux/store.js";
import { logout } from "../redux/slices/authSlice";
import authService from "./auth.service.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/register") &&
      !originalRequest.url.includes("/auth/reset-password-link")
    ) {
      originalRequest._retry = true;
      try {
        await authService.refreshToken();

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
