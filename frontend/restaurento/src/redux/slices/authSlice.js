
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  role: null,
  avatar: null,
  isInitializing: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, role, avatar } = action.payload;
      state.user = user;
      state.role = role;
      state.avatar = avatar;
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
      state.role = null;
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
