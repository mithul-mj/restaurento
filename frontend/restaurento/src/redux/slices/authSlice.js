
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, role } = action.payload;
      state.user = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: role,
        // Critical fields for Restaurant and Admin guards/status
        verificationStatus: user.verificationStatus,
        isOnboardingCompleted: user.isOnboardingCompleted,
        status: user.status,
      };
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    setAuthFailed: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, setAuthFailed, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
