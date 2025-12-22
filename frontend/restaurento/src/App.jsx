import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VerifyEmail from './pages/VerifyEmail';
import RestaurantDetails from './pages/RestaurantDetails';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';


import UserLogin from './pages/user/UserLogin';
import UserSignup from './pages/user/UserSignup';
import AdminLogin from './pages/admin/AdminLogin';
import RestaurantLogin from './pages/restaurant/RestaurantLogin';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantSignup from './pages/restaurant/RestaurantSignup';


import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from './redux/slices/authSlice';
import ProtectedRoutes from './components/routes/ProtectedRoutes';
import PublicRoutes from './components/routes/PublicRoutes';

import './App.css';

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
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

        <Route element={<ProtectedRoutes allowedRoles={['USER']} />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>


        <Route element={<ProtectedRoutes allowedRoles={['RESTAURANT']} />}>
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
        </Route>


        <Route element={<ProtectedRoutes allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
