// src/store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  role: null,
  isInitializing: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, role } = action.payload;
      state.user = user;
      state.role = role;
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
  },
});

export const { setCredentials, setAuthFailed, logout } = authSlice.actions;
export default authSlice.reducer;
