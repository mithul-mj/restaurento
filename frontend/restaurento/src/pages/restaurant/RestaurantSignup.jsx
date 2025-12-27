import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthLayout from '../../components/layouts/AuthLayout';
import authService from '../../services/auth.service';
import VerifyEmailModal from '../../components/modals/VerifyEmailModal';

const RestaurantSignup = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState("")
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setServerError("");
            await authService.restaurantRegister({
                ...data,
                fullName: data.restaurantName
            });

            setRegisteredEmail(data.email);
            setShowVerifyModal(true);
        } catch (error) {

            if (error.response?.status === 403) {
                setRegisteredEmail(data.email);
                setShowVerifyModal(true);
                return;
            }

            const message = error.response?.data?.message || "Something went wrong. Please try again.";
            setServerError(message);
        }
    };

    const handleVerifyOtp = async (otp) => {
        try {
            await authService.verifyEmail({ email: registeredEmail, otp, role: 'RESTAURANT' });

            navigate('/login');
        } catch (error) {

            alert(error.response?.data?.message || "Verification failed");
        }
    };


    return (
        <AuthLayout
            title="Become a Partner"
            subtitle="Join thousands of restaurants growing their business with Restauranto."
            image="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
        >
            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                    {serverError}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="restaurantName" className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
                        Restaurant Name
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="restaurantName"
                            className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                            ${errors.restaurantName
                                    ? 'border-red-500 bg-red-50 focus:border-red-500'
                                    : 'border-gray-200 bg-gray-50/50 focus:border-[#ff5e00] focus:bg-white'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            placeholder="Enter Restaurant Name"
                            {...register("restaurantName", { required: "Restaurant Name is required" })}
                        />
                    </div>
                    {errors.restaurantName && <span className="text-red-500 text-xs mt-1">{errors.restaurantName.message}</span>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
                        Business Email
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                            ${errors.email
                                    ? 'border-red-500 bg-red-50 focus:border-red-500'
                                    : 'border-gray-200 bg-gray-50/50 focus:border-[#ff5e00] focus:bg-white'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            placeholder="Enter business email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                    </div>
                    {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className={`w-full px-4 py-3.5 pr-10 rounded-lg border focus:outline-none transition-colors
                            ${errors.password
                                    ? 'border-red-500 bg-red-50 focus:border-red-500'
                                    : 'border-gray-200 bg-gray-50/50 focus:border-[#ff5e00] focus:bg-white'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            placeholder="Create a password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters"
                                },
                                pattern: {
                                    value: /^(?=.*[A-Z])(?=.*\d)/,
                                    message: "Password must contain at least 1 uppercase letter and 1 number"
                                }
                            })}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            className={`w-full px-4 py-3.5 pr-10 rounded-lg border focus:outline-none transition-colors
                            ${errors.confirmPassword
                                    ? 'border-red-500 bg-red-50 focus:border-red-500'
                                    : 'border-gray-200 bg-gray-50/50 focus:border-[#ff5e00] focus:bg-white'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            placeholder="Confirm password"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (val) => {
                                    if (watch('password') != val) {
                                        return "Your passwords do not match";
                                    }
                                }
                            })}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <span className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</span>}
                </div>

                <button
                    type="submit"
                    className="w-full py-3.5 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-lg font-semibold text-sm transition-colors shadow-sm mt-2"
                >
                    Register Restaurant
                </button>
            </form>

            <p className="text-center mt-8 text-sm text-gray-300 md:text-gray-500">
                Already a partner? <Link to="/restaurant/login" className="text-[#ff5e00] font-semibold hover:underline">Login here.</Link>
            </p>
            {showVerifyModal && (
                <VerifyEmailModal
                    email={registeredEmail}
                    onClose={() => setShowVerifyModal(false)}
                    onVerify={handleVerifyOtp}
                />
            )}
        </AuthLayout>
    );
};

export default RestaurantSignup;
