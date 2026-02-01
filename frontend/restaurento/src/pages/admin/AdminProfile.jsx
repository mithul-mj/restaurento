import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import authService from "../../services/auth.service";
import { showToast, showConfirm, showError } from "../../utils/alert";
import { logout } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        showConfirm("Logout?", "Are you sure you want to log out?").then(
            async (result) => {
                if (result.isConfirmed) {
                    await authService.logout("ADMIN");
                    dispatch(logout());
                    navigate("/admin/login");
                    showToast("Logged out successfully");
                }
            }
        );
    };

    const handleChangePassword = async () => {
        const result = await showConfirm(
            "Reset Password?",
            `We will send a password reset link to ${user?.email}`,
            "Yes, Send Link"
        );

        if (result.isConfirmed) {
            try {
                await authService.forgotPassword({
                    email: user?.email,
                    role: "ADMIN",
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
        <div className="w-full max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Manage admins Profile details
                </p>
            </div>

            <div className="space-y-6">
                {/* Email Section */}
                <div className="bg-[#fffcf9] border border-[#f5efe9] rounded-xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">
                            Email : {user?.email}
                        </p>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="bg-[#fffcf9] border border-[#f5efe9] rounded-xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">
                            Change password
                        </p>
                    </div>
                    <button
                        onClick={handleChangePassword}
                        className="bg-[#faddca] text-[#e65c00] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#ffdec2] transition-colors">
                        Change
                    </button>
                    {/* Typo in screenshot says "Chnage", I'm correcting to "Change" */}
                </div>

                {/* Logout Section */}
                <div className="bg-[#fff5f5] border border-[#ffe0e0] rounded-xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                        <h4 className="text-sm font-bold text-[#ff4d4d]">Log Out</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            You will be returned to the login screen.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-[#ff3b3b] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#e03535] transition-colors shadow-red-200 shadow-lg"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
