import api from "./api";

const userService = {
  getProfile: async () => {
    const response = await api.get("/profile");
    return response.data;
  },
};

export default userService;
