import React, { useState, useEffect } from "react";
import { showToast, showConfirm } from "../../utils/alert";
import {
  Copy,
  Wallet,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import authService from "../../services/auth.service";
import userService from "../../services/user.service";
import { motion } from "framer-motion";
import { REFERRAL_REWARD_REFERRER, REFERRAL_REWARD_NEW_USER } from "../../constants/constants";

const Profile = () => {
  const { user: reduxUser } = useSelector((state) => state.auth);
  const [user, setUser] = useState({
    ...reduxUser,
    avatar: reduxUser?.avatar,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
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
    const inviteLink = `${window.location.origin}/signup?ref=${user.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    showToast("Referral link copied!", "success");
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
        await authService.logout("USER");
      } catch (error) {
        console.error("Logout failed", error);
      } finally {
        dispatch(logout());
        navigate("/login");
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading && !user?.fullName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff5e00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* Background Decorative Element */}
      <div className="h-48 w-full bg-gradient-to-r from-[#ff5e00] to-[#ff9500] absolute top-0 left-0 -z-10 opacity-5 md:h-64" />

      <motion.main
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10">
          <div className="relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=ff5e00&color=fff&size=200`
                }
                alt={user?.fullName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            </div>

          <div className="flex-1 text-center md:text-left mb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {user?.fullName}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold uppercase tracking-wider border border-green-100">
                <ShieldCheck size={12} />
                Verified
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-x-4 gap-y-1 text-gray-500">
              <span className="text-sm font-medium">{user?.email}</span>
              <span className="hidden md:inline w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar size={14} className="text-gray-400" />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "--"}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/edit-profile" className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              Edit Profile
            </Link>
          </div>
        </motion.div>

        <div className="mb-10">
          {/* Wallet Card - Full Width */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-[#ff5e00]">
                <Wallet size={24} />
                <span className="font-bold text-sm uppercase tracking-widest">Available Balance</span>
              </div>
              <div className="text-4xl md:text-5xl font-black text-gray-900">
                ₹{(user?.walletBalance ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium">Use for quick bookings and instant refunds</p>
            </div>
            <div className="relative z-10 w-full sm:w-auto">
              <Link to="/my-wallet" className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[#fff5eb] text-[#ff5e00] text-sm font-bold rounded-2xl hover:bg-[#ffe0cc] transition-all group/btn">
                Wallet History
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Rewards Section */}
        <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full -mr-32 -mt-32 -z-0" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 relative z-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-[#ff5e00] rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                <Share2 size={12} />
                Referral Program
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tight">
                Invite Friends & <br className="hidden md:block" /> Get Rewarded
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-sm mb-8 leading-relaxed">
                Share your unique link and earn <span className="font-bold text-gray-900">₹{REFERRAL_REWARD_REFERRER}</span> after their first booking. 
                Your friends also get <span className="font-bold text-gray-900">₹{REFERRAL_REWARD_NEW_USER}</span> on their first reservation.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                  <span className="flex-1 text-xs font-mono font-bold text-gray-500 truncate select-all">
                    {`${window.location.origin}/signup?ref=${user.referralCode}`}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0 ${
                    copied 
                    ? "bg-green-600 text-white" 
                    : "bg-[#ff5e00] text-white hover:bg-[#e05200] shadow-lg shadow-orange-100"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={18} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="hidden lg:flex w-48 h-48 bg-orange-50 rounded-full items-center justify-center text-orange-200">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Global Actions */}
        <motion.div variants={itemVariants} className="mt-10 flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-8 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={18} />
            Sign Out from Account
          </button>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Profile;
