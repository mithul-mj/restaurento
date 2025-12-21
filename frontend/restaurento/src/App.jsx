import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VerifyEmail from './pages/VerifyEmail';
import RestaurantDetails from './pages/RestaurantDetails';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';

// Auth Pages
import UserLogin from './pages/user/UserLogin';
import UserSignup from './pages/user/UserSignup';
import AdminLogin from './pages/admin/AdminLogin';
import RestaurantLogin from './pages/restaurant/RestaurantLogin';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantSignup from './pages/restaurant/RestaurantSignup';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>


        {/* User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Restaurant Routes */}
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/signup" element={<RestaurantSignup />} />
        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />

      </Routes>
    </Router>
  );
}

export default App;
