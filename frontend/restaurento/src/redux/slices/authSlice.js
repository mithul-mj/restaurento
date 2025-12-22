import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: true, // Start with loading true for checkAuth
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;

            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('accessToken', action.payload.tokens.accessToken);
            localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
        },
        loginFailure: (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
        },
        logout: (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;

            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        checkAuthStart: (state) => {
            state.loading = true;
        },
        checkAuthFinish: (state) => {
            state.loading = false;
        }
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, checkAuthStart, checkAuthFinish } = authSlice.actions;

// checkAuth Thunk
export const checkAuth = () => async (dispatch) => {
    dispatch(checkAuthStart());
    try {
        const accessToken = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');

        if (accessToken && user) {
            // In a real app, you might ping the backend here to verify the token is still valid
            // For now, we assume if it's in storage, it's valid
        } else {
            // If something is missing, clear it out
            dispatch(logout());
        }
    } catch (error) {
        dispatch(logout());
    } finally {
        dispatch(checkAuthFinish());
    }
};

export default authSlice.reducer;
