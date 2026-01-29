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
import { Toaster } from "sonner";
import "./App.css";
import UserLayout from "./components/layouts/UserLayout";
import RestaurantSettings from "./pages/restaurant/RestaurentSettings";
import PreApproval from "./pages/restaurant/PreApproval";
import VerificationPending from "./pages/restaurant/VerificationPending";
import RestaurantStatusGuard from "./components/routes/RestaurantStatusGuard";
import RestaurantLayout from "./components/layouts/RestaurantLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import Bookings from "./pages/restaurant/Bookings";
import MenuPage from "./pages/restaurant/Menu";
import Earnings from "./pages/restaurant/Earnings";
import WalletPage from "./pages/restaurant/Wallet";
import Notifications from "./pages/restaurant/Notifications";
import RestaurantManagement from "./pages/admin/RestaurantManagement";
import RestaurantDetails from "./pages/admin/RestaurantDetails";

function App() {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let role = "USER";
        if (window.location.pathname.startsWith("/admin")) role = "ADMIN";
        else if (window.location.pathname.startsWith("/restaurant"))
          role = "RESTAURANT";

        console.log("App.jsx: Refreshing token for role:", role); // DEBUG LOG
        const response = await authService.refreshToken(role);
        if (!response.data.role) {
          throw new Error("Role missing in refresh response");
        }
        dispatch(
          setCredentials({
            user: response.data.user,
            role: response.data.role?.toUpperCase(),
            avatar: response.data.user.avatar,
          }),
        );
      } catch (error) {
        if (error.response?.status !== 401 && error.code !== "ECONNABORTED") {
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
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/signup" element={<RestaurantSignup />} />
        </Route>

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoutes allowedRoles={["USER"]} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={["RESTAURANT"]} />}>
          <Route element={<RestaurantStatusGuard />}>
            <Route path="/restaurant/pre-approval" element={<PreApproval />} />
            <Route
              path="/restaurant/verification-pending"
              element={<VerificationPending />}
            />
            <Route
              path="/restaurant/onboarding"
              element={<RestaurantOnboarding />}
            />

            <Route element={<RestaurantLayout />}>
              <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
              <Route path="/restaurant/bookings" element={<Bookings />} />
              <Route path="/restaurant/menu" element={<MenuPage />} />
              <Route path="/restaurant/earnings" element={<Earnings />} />
              <Route path="/restaurant/wallet" element={<WalletPage />} />
              <Route path="/restaurant/notifications" element={<Notifications />} />
              <Route path="/restaurant/settings" element={<RestaurantSettings />} />
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/restaurants" element={<RestaurantManagement />} />
            <Route
              path="/admin/restaurants/:restaurantId"
              element={<RestaurantDetails />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
