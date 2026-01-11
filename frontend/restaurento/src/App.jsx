import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/user/Home";
import Profile from "./pages/user/Profile";
import EditProfile from "./pages/user/EditProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";

import UserLogin from "./pages/user/UserLogin";
import UserSignup from "./pages/user/UserSignup";
import AdminLogin from "./pages/admin/AdminLogin";
import RestaurantLogin from "./pages/restaurant/RestaurantLogin";
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import RestaurantSignup from "./pages/restaurant/RestaurantSignup";
import RestaurantOnboarding from "./pages/restaurant/Onboarding";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setAuthFailed } from "./redux/slices/authSlice";
import ProtectedRoutes from "./components/routes/ProtectedRoutes";
import PublicRoutes from "./components/routes/PublicRoutes";
import authService from "./services/auth.service";
import { setCredentials } from "./redux/slices/authSlice";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authService.refreshToken();
        if (!response.data.role) {
          throw new Error("Role missing in refresh response");
        }
        dispatch(
          setCredentials({
            user: response.data.user,
            role: response.data.role?.toUpperCase(),
            avatar: response.data.user.avatar,
          })
        );
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Auth init failed:", error);
        }
        dispatch(setAuthFailed());
      }
    };
    initializeAuth();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff5e00]"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/signup" element={<RestaurantSignup />} />
        </Route>

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoutes allowedRoles={["USER"]} />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={["RESTAURANT"]} />}>
          <Route
            path="/restaurant/dashboard"
            element={<RestaurantDashboard />}
          />
          <Route
            path="/restaurant/onboarding"
            element={<RestaurantOnboarding />}
          />
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
