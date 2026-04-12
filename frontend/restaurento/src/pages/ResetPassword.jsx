import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import authService from "../services/auth.service";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = searchParams.get("token");
  const id = searchParams.get("id");
  const role = searchParams.get("role");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setServerError("");
      if (!token || !id || !role) {
        setServerError("Invalid password reset link.");
        return;
      }

      await authService.resetPassword({
        token,
        id,
        role,
        newPassword: data.password,
      });

      setSuccessMessage("Password reset successfully!");
      setTimeout(() => {
        if (role === "RESTAURANT") navigate("/restaurant/login");
        else if (role === "ADMIN") navigate("/admin/login");
        else navigate("/login");
      }, 2000);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to reset password. Link might be expired.";
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">

      <div className="absolute top-6 left-6 flex items-center">
        <img
          src="/LogoWithText.png"
          alt="Restaurento"
          className="h-10 w-auto"
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 w-full max-w-[480px] text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
            Set a New Password
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Your new password must be at least 8 characters long.
          </p>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-6">
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 text-left">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                                    ${errors.password
                      ? "border-red-500 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-gray-50/50 focus:border-[#ff5e00] focus:bg-white"
                    }
                                    text-gray-900 placeholder-gray-400 text-sm pr-10`}
                  placeholder="StrongP@ssw0rd!"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*\d)/,
                      message: "At least 1 uppercase and 1 number",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>


            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-3.5 rounded-lg border focus:outline-none transition-colors
                                    ${errors.confirmPassword
                      ? "border-red-500 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-gray-50/50 focus:border-[#ff5e00] focus:bg-white"
                    }
                                    text-gray-900 placeholder-gray-400 text-sm pr-10`}
                  placeholder="StrongP@ssw0rd!"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) => {
                      if (watch("password") != val) {
                        return "Passwords do not match";
                      }
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
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
              className="w-full py-4 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-lg font-bold text-sm transition-colors shadow-lg hover:shadow-xl mt-4 disabled:opacity-70">
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-8">
            <Link
              to={
                role === "RESTAURANT"
                  ? "/restaurant/login"
                  : role === "ADMIN"
                    ? "/admin/login"
                    : "/login"
              }
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
