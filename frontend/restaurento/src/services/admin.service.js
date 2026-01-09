import axios from "axios";
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
};

export default adminService;
