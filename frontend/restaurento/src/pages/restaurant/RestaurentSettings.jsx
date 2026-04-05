import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { showConfirm, showToast, showError, showScheduleClosure } from '../../utils/alert';
import authService from '../../services/auth.service';
import restaurantService from '../../services/restaurant.service';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { X } from "lucide-react";

const RestaurantSettings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isClosed, setIsClosed] = useState(false);
    const [closedTill, setClosedTill] = useState(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await restaurantService.getProfile();
                if (res.success && res.restaurant) {
                    setIsClosed(res.restaurant.isTemporaryClosed || false);
                    setClosedTill(res.restaurant.closedTill || null);
                    setEmail(res.restaurant.email || "");
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleToggleClosed = async () => {
        if (!isClosed) {
            // Toggling to CLOSED using centralized utility
            const { value: formValues } = await showScheduleClosure();

            if (formValues) {
                setLoading(true);
                try {
                    const res = await restaurantService.updateSettings({
                        isTemporaryClosed: true,
                        closedTill: formValues.closedTill,
                        shouldCancelBookings: formValues.shouldCancelBookings
                    });
                    if (res.success) {
                        setIsClosed(true);
                        setClosedTill(formValues.closedTill);
                        showToast("Restaurant scheduled for closure", "success");
                    }
                } catch (error) {
                    showToast(error.response?.data?.message || "Action failed", "error");
                } finally {
                    setLoading(false);
                }
            }
        } else {
            // Toggling back to OPEN
            const result = await showConfirm(
                "Resume Business?",
                "Are you sure you want to re-open the restaurant for new bookings?",
                "Yes, Re-open"
            );

            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const res = await restaurantService.updateSettings({ isTemporaryClosed: false });
                    if (res.success) {
                        setIsClosed(false);
                        setClosedTill(null);
                        showToast("Restaurant is now active", "success");
                    }
                } catch (error) {
                    showToast("Failed to update status", "error");
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const handleLogout = async () => {
        const result = await showConfirm(
            "Logout",
            "Are you sure you want to logout?",
            "Yes, Logout"
        );
        if (result.isConfirmed) {
            try {
                await authService.logout("RESTAURANT");
                showToast("Logged out successfully", "success");
            } catch (error) {
                console.error("Logout failed", error);
            } finally {
                dispatch(logout());
                navigate("/restaurant/login");
            }
        }
    };

    const handleChangePassword = async () => {
        const result = await showConfirm(
            "Reset Password?",
            `We will send a password reset link to ${email}`,
            "Yes, Send Link"
        );

        if (result.isConfirmed) {
            try {
                await authService.forgotPassword({
                    email: email,
                    role: "RESTAURANT",
                });
                showToast("Reset Link Sent", "success");
            } catch (error) {
                showError(
                    "Error",
                    error.response?.data?.message || "Failed to send reset link"
                );
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6 px-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Manage Your Restaurant Profile</h2>

            <div className="space-y-4 max-w-3xl mx-auto">
                {/* Toggle Card */}
                <div className={`group p-8 rounded-[28px] border-2 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6 ${isClosed ? 'bg-[#fff5f0] border-orange-200/60 shadow-xl shadow-orange-500/5' : 'bg-white border-gray-50 hover:border-gray-100 shadow-sm hover:shadow-xl'}`}>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <div className={`w-2 h-2 rounded-full ${isClosed ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                            <h3 className={`font-black tracking-tight text-xl transition-colors ${isClosed ? 'text-orange-950' : 'text-gray-900'}`}>
                                {isClosed ? 'Restaurant is Temporarily Scheduled to Close' : 'Business Availability Control'}
                            </h3>
                        </div>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-lg">
                            {isClosed && closedTill ? (
                                <div className="mt-4 inline-flex flex-col md:flex-row items-start md:items-center gap-4 bg-white/80 p-4 rounded-2xl border border-orange-100 shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Scheduled Re-opening</span>
                                        <span className="text-gray-900 font-bold">
                                            {new Date(closedTill).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="hidden md:block w-px h-8 bg-orange-100" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Re-opening Time</span>
                                        <span className="text-gray-900 font-bold">
                                            {new Date(closedTill).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                "Control your restaurant's visibility and booking availability. Toggling this will pause all new reservations until your chosen re-opening date."
                            )}
                        </p>
                    </div>
                    <button
                        onClick={handleToggleClosed}
                        disabled={loading}
                        className={`group relative w-20 h-10 rounded-full transition-all duration-300 p-1.5 shadow-inner focus:outline-none focus:ring-4 focus:ring-orange-500/10 ${isClosed ? 'bg-orange-500' : 'bg-gray-100'}`}
                    >
                        <div className={`bg-white w-7 h-7 rounded-full transition-all duration-500 shadow-xl flex items-center justify-center transform ${isClosed ? 'translate-x-10 rotate-90' : 'translate-x-0'}`}>
                           {isClosed ? <X size={14} className="text-orange-500" strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                        </div>
                    </button>
                </div>

                {/* Edit Restaurent Details */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-semibold text-gray-800">Edit Your Restaurant Details</h3>

                    </div>
                    <Link to="/restaurant/edit-restaurant" className="px-6 py-1.5 bg-[#ffedd5] text-[#ea580c] rounded-md text-sm font-bold hover:bg-orange-200 transition-colors">
                        edit
                    </Link>
                </div>

                {/* Email */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">Email : {loading ? <Loader size="xs" showText={false} /> : email}</h3>

                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-semibold text-gray-800">Change Password</h3>

                    </div>
                    <button
                        onClick={handleChangePassword}
                        className="px-6 py-1.5 bg-[#ffedd5] text-[#ea580c] rounded-md text-sm font-bold hover:bg-orange-200 transition-colors">
                        Change
                    </button>
                </div>

                {/* Log Out */}
                <div className="bg-red-50/50 border border-red-100 p-6 rounded-xl flex items-center justify-between mt-8">
                    <div>
                        <h3 className="font-bold text-red-500">Log Out</h3>
                        <p className="text-sm text-gray-500 mt-1">You will be returned to the login screen.</p>
                    </div>
                    <button
                        className="px-8 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 shadow-sm transition-all"
                        onClick={handleLogout}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSettings;
