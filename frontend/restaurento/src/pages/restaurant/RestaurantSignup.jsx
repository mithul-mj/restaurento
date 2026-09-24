import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { showToast, showError } from "../../utils/alert";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthLayout from "../../components/layouts/AuthLayout";
import authService from "../../services/auth.service";
import VerifyEmailModal from "../../components/modals/VerifyEmailModal";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import STATUS_CODES from "../../constants/statusCodes.js";


import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../schemas/authSchema";

const RestaurantSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      await authService.signup(data, "RESTAURANT");

      setRegisteredEmail(data.email);
      setShowVerifyModal(true);
    } catch (error) {
      if (error.response?.status === STATUS_CODES.FORBIDDEN) {
        setRegisteredEmail(data.email);
        setShowVerifyModal(true);
        return;
      }

      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setServerError(message);
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      await authService.verifyEmail({
        email: registeredEmail,
        otp,
        role: "RESTAURANT",
      });
      showToast("Verification Successful", "success");
      navigate("/restaurant/login");
    } catch (error) {
      showError(
        "Verification Failed",
        error.response?.data?.message || "Verification failed"
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authService.googleLogin(
        credentialResponse.credential,
        "RESTAURANT",
      );
      dispatch(
        setCredentials({
          user: response.data.user,
          role: "RESTAURANT",
        }),
      );
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
        "Google login failed. Please try again.",
      );
    }
  };

  return (
    <AuthLayout
      title="Become a Partner"
      subtitle="Join thousands of restaurants growing their business with Restaurento."
      image="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
            Owner Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="fullName"
              className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                            ${errors.fullName
                  ? "border-red-500 bg-red-50 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#ff5e00] focus:bg-white"
                }
                            text-gray-900 placeholder-gray-400 text-sm`}
              placeholder="Enter Owner Name"
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <span className="text-red-500 text-xs mt-1">
              {errors.fullName.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
            Business Email
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                            ${errors.email
                  ? "border-red-500 bg-red-50 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#ff5e00] focus:bg-white"
                }
                            text-gray-900 placeholder-gray-400 text-sm`}
              placeholder="Enter business email"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <span className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className={`w-full px-4 py-3.5 pr-10 rounded-lg border focus:outline-none transition-colors
                            ${errors.password
                  ? "border-red-500 bg-red-50 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#ff5e00] focus:bg-white"
                }
                            text-gray-900 placeholder-gray-400 text-sm`}
              placeholder="Create a password"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-white md:text-gray-800 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className={`w-full px-4 py-3.5 pr-10 rounded-lg border focus:outline-none transition-colors
                            ${errors.confirmPassword
                  ? "border-red-500 bg-red-50 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#ff5e00] focus:bg-white"
                }
                            text-gray-900 placeholder-gray-400 text-sm`}
              placeholder="Confirm password"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-lg font-semibold text-sm transition-colors shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? "Registering..." : "Register Restaurant"}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gray-300 md:bg-gray-200 flex-1"></div>
        <span className="text-gray-400 md:text-gray-400 text-xs font-medium">
          OR
        </span>
        <div className="h-px bg-gray-300 md:bg-gray-200 flex-1"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setServerError("Google login failed")}
          theme="outline"
          size="large"
          width="100%"
          text="continue_with"
          shape="rectangular"
        />
      </div>

      <p className="text-center mt-8 text-sm text-gray-300 md:text-gray-500">
        Already a partner?{" "}
        <Link
          to="/restaurant/login"
          className="text-[#ff5e00] font-semibold hover:underline">
          Login here.
        </Link>
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
