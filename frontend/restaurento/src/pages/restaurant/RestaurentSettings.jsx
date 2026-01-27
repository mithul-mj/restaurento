import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    CalendarCheck,
    UtensilsCrossed,
    BarChart3,
    Settings,
    Wallet,
    HelpCircle,
    Bell
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { showConfirm, showToast } from '../../utils/alert';
import authService from '../../services/auth.service';
import restaurantService from '../../services/restaurant.service';
import { useNavigate } from 'react-router-dom';

const RestaurantSettings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isClosed, setIsClosed] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await restaurantService.getProfile();
                if (res.success && res.restaurant) {
                    setIsClosed(res.restaurant.isTemporaryClosed || false);
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

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Bookings', icon: <CalendarCheck size={20} /> },
        { name: 'Menu', icon: <UtensilsCrossed size={20} /> },
        { name: 'Earnings', icon: <BarChart3 size={20} /> },
        { name: 'Settings', icon: <Settings size={20} />, active: true },
        { name: 'Wallet & Payout', icon: <Wallet size={20} /> },
    ];

    const handleToggleClosed = async () => {
        const newValue = !isClosed;
        try {
            // Optimistic update
            setIsClosed(newValue);
            const res = await restaurantService.updateSettings({ isTemporaryClosed: newValue });
            if (res.success) {
                showToast(res.message, "success");
            } else {
                setIsClosed(!newValue); // Revert
                showToast("Failed to update status", "error");
            }
        } catch (error) {
            console.error("Update settings failed", error);
            setIsClosed(!newValue); // Revert
            showToast("Failed to update status", "error");
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

    return (
        <div className="max-w-4xl mx-auto py-6 px-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Manage Your Restaurant Profile</h2>

            <div className="space-y-4 max-w-3xl mx-auto">
                {/* Toggle Card */}
                <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-xl flex items-center justify-between">
                    <div className="max-w-xl">
                        <h3 className="font-bold text-gray-900 text-base">Restaurant is Temporarily Closed</h3>
                        <p className="text-sm text-[#ea580c] mt-1">
                            Activating this will stop new booking requests and display a 'Temporarily Closed' badge to users.
                        </p>
                    </div>
                    <button
                        onClick={handleToggleClosed}
                        disabled={loading}
                        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isClosed ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${isClosed ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* Edit Restaurent Details */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-semibold text-gray-800">Edit Your Restaurant Details</h3>

                    </div>
                    <button className="px-6 py-1.5 bg-[#ffedd5] text-[#ea580c] rounded-md text-sm font-bold hover:bg-orange-200 transition-colors">
                        edit
                    </button>
                </div>

                {/* Email */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-semibold text-gray-800">Email : {loading ? "Loading..." : email}</h3>

                    </div>
                    <button className="px-6 py-1.5 bg-[#ffedd5] text-[#ea580c] rounded-md text-sm font-bold hover:bg-orange-200 transition-colors">
                        edit
                    </button>
                </div>

                {/* Change Password */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-semibold text-gray-800">Change Password</h3>

                    </div>
                    <button className="px-6 py-1.5 bg-[#ffedd5] text-[#ea580c] rounded-md text-sm font-bold hover:bg-orange-200 transition-colors">
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