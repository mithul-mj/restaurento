import React, { useState } from 'react';
import { showError, showToast, showSuccess } from "../../utils/alert";
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthLayout from '../../components/layouts/AuthLayout';
import authService from '../../services/auth.service';
import VerifyEmailModal from '../../components/modals/VerifyEmailModal';
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import STATUS_CODES from "../../constants/statusCodes.js";


import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../schemas/authSchema";

const UserSignup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams()
    const referralUrlCode = searchParams.get('ref');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dispatch = useDispatch();

    const [serverError, setServerError] = useState("");

    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(signupSchema), defaultValues: {
            referralCode: referralUrlCode || ""
        }
    });

    const onSubmit = async (data) => {
        try {
            setServerError("");
            await authService.signup(data, "USER");

            setRegisteredEmail(data.email);
            showSuccess("Signup Successful", "Please verify your email to continue.");
            setShowVerifyModal(true);
        } catch (error) {

            if (error.response?.status === STATUS_CODES.FORBIDDEN) {
                setRegisteredEmail(data.email);
                showToast("Please verify your email", "info");
                setShowVerifyModal(true);
                return;
            }

            const message = error.response?.data?.message || "Something went wrong. Please try again.";
            setServerError(message);
            showError("Signup Failed", message);
        }
    };

    const handleVerifyOtp = async (otp) => {
        try {
            await authService.verifyEmail({ email: registeredEmail, otp, role: 'USER' });
            showToast("Email Verified Successfully", "success");
            navigate('/login');
        } catch (error) {
            showError("Verification Failed", error.response?.data?.message || "Verification failed");
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            const response = await authService.googleLogin(tokenResponse.access_token, 'USER', referralUrlCode);
            dispatch(setCredentials({
                user: response.data.user,
                role: 'USER',
                avatar: response.data.user.avatar
            }))
            showToast("Login Successful", "success");
        } catch (error) {
            const message = error.response?.data?.message || "Google login failed. Please try again.";
            setServerError(message);
            showError("Login Failed", message);
        }
    }

    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => showError("Login Failed", "Google login failed")
    })


    return (
        <AuthLayout
            title="Create Your Account"
            subtitle="Find top restaurants, pre-order your favorites, and skip the waiting lines."
        >
            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                    {serverError}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
                        Full Name
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="fullName"
                            className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                            ${errors.fullName
                                    ? 'border-red-500 bg-red-50 focus:border-red-500'
                                    : 'border-gray-200 bg-white focus:border-[#ff5e00] focus:bg-white'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            placeholder="Enter your Full Name"
                            {...register("fullName")}
                        />
                    </div>
                    {errors.fullName && <span className="text-red-500 text-xs mt-1">{errors.fullName.message}</span>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
                        Email
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                            ${errors.email
                                    ? 'border-red-500 bg-red-50 focus:border-red-500'
                                    : 'border-gray-200 bg-white focus:border-[#ff5e00] focus:bg-white'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            placeholder="Enter your email address"
                            {...register("email")}
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
                                    : 'border-gray-200 bg-white focus:border-[#ff5e00] focus:bg-white'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            placeholder="Enter your password"
                            {...register("password")}
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
                                    : 'border-gray-200 bg-white focus:border-[#ff5e00] focus:bg-white'}
                            text-gray-900 placeholder-gray-400 text-sm`}
                            placeholder="Enter your password"
                            {...register("confirmPassword")}
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

                <div className="hidden">
                    <input type="hidden" {...register("referralCode")} />
                </div>

                {referralUrlCode && (
                    <div className="bg-orange-500/10 border border-orange-500/40 text-[#ff5e00] px-4 py-3 rounded-lg text-sm font-bold text-center">
                        🎁 Referral Code Applied: {referralUrlCode}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-lg font-semibold text-sm transition-colors shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Signing Up..." : "Sign Up"}
                </button>
            </form>

            <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-gray-300 md:bg-gray-200 flex-1"></div>
                <span className="text-gray-400 md:text-gray-400 text-xs font-medium">OR</span>
                <div className="h-px bg-gray-300 md:bg-gray-200 flex-1"></div>
            </div>

            <button onClick={() => loginWithGoogle()} className="w-full py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-gray-700 font-medium text-sm">Continue with Google</span>
            </button>

            <p className="text-center mt-8 text-sm text-gray-300 md:text-gray-500">
                Already have an account? <Link to="/login" className="text-[#ff5e00] font-semibold hover:underline">Login here.</Link>
            </p>
            <p className="text-center mt-4 text-xs text-gray-300 md:text-gray-400">
                Are you a restaurant? <Link to="/restaurant/signup" className="text-[#ff5e00] hover:underline">Register here</Link>
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

export default UserSignup;
