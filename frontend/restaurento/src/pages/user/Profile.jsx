import React, { useState, useEffect } from "react";
import { showToast, showError, showConfirm } from "../../utils/alert";

import {
  Bell,
  Copy,
  Wallet,
  MapPinIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import authService from "../../services/auth.service";
import userService from "../../services/user.service";

const Profile = () => {
  const { user: reduxUser, avatar } = useSelector((state) => state.auth);
  // Merge Redux user (name/email) with Redux avatar (which is separate)
  const [user, setUser] = useState({ ...reduxUser, avatar });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const referralCode = user?.referralCode || "WELCOME50";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success) {
          setUser((prev) => ({ ...prev, ...response.user }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    showToast("Referral Code Copied", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    const result = await showConfirm(
      "Logout",
      "Are you sure you want to logout?",
      "Yes, Logout"
    );
    if (result.isConfirmed) {
      try {
        await authService.logout();
        dispatch(logout());
        showToast("Logged out successfully", "success");
        navigate("/login");
      } catch (error) {
        console.error("Logout failed", error);
        showError("Logout Failed", "please try again");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Restauranto
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-gray-500 hover:text-[#ff5e00] transition-colors">
            Explore
          </Link>
          <Link
            to="/bookings"
            className="text-gray-500 hover:text-[#ff5e00] transition-colors">
            My Bookings
          </Link>
          <Link
            to="/profile"
            className="text-gray-900 font-medium hover:text-[#ff5e00] transition-colors">
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
            <img
              src={
                user?.avatar ||
                "https://ui-avatars.com/api/?name=" +
                (user?.fullName || "User") +
                "&background=random"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center md:text-left">
          My Profile
        </h1>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shrink-0 border-4 border-[#fff0e3]">
              <img
                src={
                  user?.avatar ||
                  "https://ui-avatars.com/api/?name=" +
                  (user?.fullName || "User") +
                  "&background=random"
                }
                alt={user?.fullName || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {user?.fullName || "User Name"}
              </h2>
              <p className="text-gray-500 text-sm mb-1">
                {user?.email || "email@example.com"}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                <MapPinIcon size={16} className="text-gray-500" />
                <p className="text-gray-500 text-sm">
                  {user?.address || "( Location not set )"}
                </p>
              </div>

              <p className="text-[#ff5e00] text-xs font-semibold">
                Joined in{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).getFullYear()
                  : "2023"}
              </p>
            </div>
            <div>
              <button className="px-5 py-2 bg-[#fff5eb] text-[#ff5e00] text-sm font-semibold rounded-lg hover:bg-[#ffe0cc] transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#fff5eb] rounded-full flex items-center justify-center text-[#ff5e00]">
                <Wallet size={24} />
              </div>
              <span className="text-[#ff5e00] font-bold text-lg">
                Wallet Balance
              </span>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-3xl font-extrabold text-gray-900">
                ₹{user?.walletBalance ?? 20}
              </div>
              <button className="text-[#ff5e00] text-xs font-bold hover:underline">
                View Transactions
              </button>
            </div>
          </div>

          <div className="bg-[#fff5f5] rounded-2xl p-6 border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-red-500 font-bold text-lg mb-1">Log Out</h3>
              <p className="text-gray-500 text-sm">
                You will be returned to the login screen.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-colors shadow-md shadow-red-200">
              Log Out
            </button>
          </div>

          <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-center md:text-left max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Referral Code
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Get <span className="font-bold text-gray-800">$5</span> on by
                  sharing you referral code. The person uses the referral code
                  on register will receive{" "}
                  <span className="font-bold text-gray-800">$3</span>.
                </p>

                <div className="flex items-center bg-[#f5f5f5] rounded-lg p-1.5 border border-dashed border-gray-300">
                  <span className="flex-1 px-4 font-mono font-bold text-gray-700 tracking-wider text-sm">
                    {referralCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-white rounded-md text-gray-500 hover:text-[#ff5e00] shadow-sm transition-colors"
                    title="Copy Code">
                    {copied ? (
                      <span className="text-xs font-bold text-green-500">
                        Copied!
                      </span>
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-gray-800">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
