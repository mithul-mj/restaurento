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
};

export default userService;
