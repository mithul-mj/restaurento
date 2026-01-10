import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react"; // Optional: using lucide-react for the back arrow
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import authService from "../../services/auth.service";

const ForgotPasswordModal = ({ onClose }) => {
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log("Reset link requested for:", data.email);
      let role;
      if (location.pathname.startsWith("/restaurant")) role = "RESTAURANT";
      else if (location.pathname.startsWith("/admin")) role = "ADMIN";
      else role = "USER";

      await authService.forgotPassword({ email: data.email, role });
      onClose();
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div
        className="bg-white p-10 rounded-3xl shadow-2xl border border-[#F2EAE5] max-w-md w-full text-center relative duration-200"
        onClick={(e) => e.stopPropagation()}>
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] mb-3">
          Forgot Your Password?
        </h1>

        <p className="text-[#A67C52] text-sm leading-relaxed mb-8 px-4">
          Enter your registered email address to receive a email with password
          reset link
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-bold text-[#333] mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@restaurant.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email format",
                },
              })}
              className={`w-full p-4 rounded-xl bg-[#FDFCFB] border ${errors.email ? "border-red-500" : "border-[#F2EAE5]"
                } focus:outline-none focus:ring-2 focus:ring-[#FF6616] transition-all`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF6616] hover:bg-[#E55A12] text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg hover:shadow-xl transform active:scale-95 duration-200">
            Send Reset Link
          </button>
        </form>

        <button
          className="mt-6 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 w-full transition-colors"
          onClick={onClose}>
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById("modal-root"));
};

export default ForgotPasswordModal;
