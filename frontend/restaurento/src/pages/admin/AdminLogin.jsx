import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import AuthLayout from '../../components/layouts/AuthLayout';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import { setCredentials } from '../../redux/slices/authSlice';
import ForgotPasswordModal from "../../components/modals/ForgotPasswordModal";

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            setServerError("");
            const response = await authService.adminLogin(data);


            dispatch(setCredentials({
                user: response.data.admin || response.data.user,
                role: 'ADMIN'
            }));

            navigate('/admin/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || "Login failed.";
            setServerError(message);
        }
    };

    return (
        <AuthLayout
            title="Administrator Login"
            subtitle="Please enter your credentials to access the admin portal."
            image="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop"
            reverse={true}
        >
            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                    {serverError}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5 ml-1">Admin Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                        ${errors.email ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-white/90 md:bg-white focus:border-[#ff5e00]'}
                        text-gray-900 placeholder-gray-400 text-sm`}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5 ml-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors pr-10
                            ${errors.password ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-white/90 md:bg-white focus:border-[#ff5e00]'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            {...register("password", { required: "Password is required" })}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <span className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</span>}
                </div>

                <div className="flex justify-between items-center">
                    <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-gray-300 md:text-[#ff5e00] text-xs font-bold hover:underline">
                        Forgot Password?
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-[#e05200] hover:bg-[#c94a00] text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-orange-900/20"
                >
                    Sign In
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">© 2024 Restauranto. All rights reserved.</p>
            </div>
            {showForgotPasswordModal && (
                <ForgotPasswordModal
                    onClose={() => setShowForgotPasswordModal(false)}
                />
            )}
        </AuthLayout>
    );
};

export default AdminLogin;
