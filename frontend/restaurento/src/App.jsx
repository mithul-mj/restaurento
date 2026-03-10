import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "sonner";
import "./App.css";

const Home = lazy(() => import("./pages/user/Home"));
const Profile = lazy(() => import("./pages/user/Profile"));
const EditProfile = lazy(() => import("./pages/user/EditProfile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));

const UserLogin = lazy(() => import("./pages/user/UserLogin"));
const UserSignup = lazy(() => import("./pages/user/UserSignup"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const RestaurantLogin = lazy(
  () => import("./pages/restaurant/RestaurantLogin"),
);
const RestaurantDashboard = lazy(
  () => import("./pages/restaurant/RestaurantDashboard"),
);
const RestaurantBookingDetails = lazy(
  () => import("./pages/restaurant/BookingDetails"),
);
const RestaurantSignup = lazy(
  () => import("./pages/restaurant/RestaurantSignup"),
);
const RestaurantOnboarding = lazy(
  () => import("./pages/restaurant/Onboarding"),
);
const NotFound = lazy(() => import("./pages/NotFound"));
const EditRestaurant = lazy(() => import("./pages/restaurant/EditRestaurant"));
const Scanner = lazy(() => import("./pages/restaurant/Scanner"));

import { useDispatch, useSelector } from "react-redux";
import { setAuthFailed } from "./redux/slices/authSlice";
import ProtectedRoutes from "./components/routes/ProtectedRoutes";
import PublicRoutes from "./components/routes/PublicRoutes";
import authService from "./services/auth.service";
import { setCredentials } from "./redux/slices/authSlice";
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

import UserLayout from "./components/layouts/UserLayout";
import PageLoader from "./components/PageLoader";
const RestaurantSettings = lazy(
  () => import("./pages/restaurant/RestaurentSettings"),
);
const PreApproval = lazy(() => import("./pages/restaurant/PreApproval"));
const VerificationPending = lazy(
  () => import("./pages/restaurant/VerificationPending"),
);
import RestaurantStatusGuard from "./components/routes/RestaurantStatusGuard";
import RestaurantLayout from "./components/layouts/RestaurantLayout";
import AdminLayout from "./components/layouts/AdminLayout";
const Bookings = lazy(() => import("./pages/restaurant/Bookings"));
const MenuPage = lazy(() => import("./pages/restaurant/Menu"));
const Earnings = lazy(() => import("./pages/restaurant/Earnings"));
const WalletPage = lazy(() => import("./pages/restaurant/Wallet"));
const Notifications = lazy(() => import("./pages/restaurant/Notifications"));
const RestaurantManagement = lazy(
  () => import("./pages/admin/RestaurantManagement"),
);
const RestaurantDetails = lazy(() => import("./pages/admin/RestaurantDetails"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminFinance = lazy(() => import("./pages/admin/Finance"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const Banners = lazy(() => import("./pages/admin/Banners"));
const UserRestaurantDetails = lazy(
  () => import("./pages/user/RestaurantDetails"),
);
const Wishlist = lazy(() => import("./pages/user/Wishlist"));
const BookingSummary = lazy(() => import("./pages/user/BookingSummary"));
const MyBookings = lazy(() => import("./pages/user/MyBookings"));
const BookingDetails = lazy(() => import("./pages/user/BookingDetails"));

function App() {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state) => state.auth);

  useEffect(() => {

    const initializeAuth = async () => {
      try {
        let role = "USER";
        if (window.location.pathname.startsWith("/admin")) role = "ADMIN";
        else if (window.location.pathname.startsWith("/restaurants"))
          role = "USER";
        else if (window.location.pathname.startsWith("/restaurant"))
          role = "RESTAURANT";

        console.log("App.jsx: Refreshing token for role:", role);
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
    return <PageLoader />;
  }

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<PageLoader />}>
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
            <Route
              path="/restaurants/:id"
              element={<UserRestaurantDetails />}
            />
            <Route element={<ProtectedRoutes allowedRoles={["USER"]} />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/my-bookings/:id" element={<BookingDetails />} />
              <Route path="/booking-summary" element={<BookingSummary />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoutes allowedRoles={["RESTAURANT"]} />}>
            <Route element={<RestaurantStatusGuard />}>
              <Route
                path="/restaurant/pre-approval"
                element={<PreApproval />}
              />
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
                <Route path="/restaurant/bookings/:id" element={<RestaurantBookingDetails />} />
                <Route path="/restaurant/check-in" element={<Scanner />} />
                <Route path="/restaurant/menu" element={<MenuPage />} />
                <Route path="/restaurant/earnings" element={<Earnings />} />
                <Route path="/restaurant/wallet" element={<WalletPage />} />
                <Route
                  path="/restaurant/notifications"
                  element={<Notifications />}
                />
                <Route
                  path="/restaurant/settings"
                  element={<RestaurantSettings />}
                />
                <Route
                  path="/restaurant/edit-restaurant"
                  element={<EditRestaurant />}
                />
              </Route>
            </Route>
          </Route>

          <Route element={<ProtectedRoutes allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route
                path="/admin/restaurants"
                element={<RestaurantManagement />}
              />
              <Route
                path="/admin/restaurants/:restaurantId"
                element={<RestaurantDetails />}
              />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/finance" element={<AdminFinance />} />
              <Route path="/admin/coupons" element={<Coupons />} />
              <Route path="/admin/banners" element={<Banners />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
