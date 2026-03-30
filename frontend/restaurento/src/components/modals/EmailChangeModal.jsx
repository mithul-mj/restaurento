import React, { useState, useEffect, useRef } from "react";
import { showToast, showSuccess } from "../../utils/alert";
import { useForm } from "react-hook-form";
import { X, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import userService from "../../services/user.service";

const EmailChangeModal = ({
    isOpen,
    onClose,
    currentEmail,
    onEmailUpdated,
}) => {
    const [step, setStep] = useState(1);
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [timeLeft, setTimeLeft] = useState(120);
    const [endTime, setEndTime] = useState(Date.now() + 120000);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
        setValue,
        watch,
        reset,
    } = useForm({
        defaultValues: {
            newEmail: "",
            otpCode: "",
        },
    });

    const newEmail = watch("newEmail");

    useEffect(() => {
        let timer;
        if (step === 2) {
            timer = setInterval(() => {
                const now = Date.now();
                const difference = endTime - now;

                if (difference <= 0) {
                    setTimeLeft(0);
                    clearInterval(timer);
                } else {
                    setTimeLeft(Math.ceil(difference / 1000));
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, endTime]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setOtpValues(["", "", "", "", "", ""]);
            reset({ newEmail: "", otpCode: "" });
            setTimeLeft(120);
            setEndTime(Date.now() + 120000);
        }
    }, [isOpen, reset]);

    if (!isOpen) return null;

    const onRequestOtp = async (data) => {
        if (data.newEmail === currentEmail) {
            setError("newEmail", {
                type: "manual",
                message: "Please enter a different email address",
            });
            return;
        }

        try {
            const response = await userService.requestEmailChange(data.newEmail);
            if (response.success) {
                setStep(2);
                setEndTime(Date.now() + 120000);
                setTimeLeft(120);
                showToast("Verification Code Sent", "success");
            } else {
                setError("root", { message: response.message || "Failed to send OTP" });
            }
        } catch (err) {
            setError("root", {
                message: err.response?.data?.message || "Something went wrong",
            });
        }
    };

    const onVerifyOtp = async (data) => {
        const otpValue = data.otpCode;
        if (otpValue.length !== 6) {
            setError("otpCode", { message: "Please enter all 6 digits" });
            return;
        }

        try {
            const response = await userService.verifyEmailChange(newEmail, otpValue);
            if (response.success) {
                onEmailUpdated(newEmail);
                onClose();
                showSuccess("Email Updated", "Your email address has been successfully changed.");
            } else {
                setError("root", { message: response.message || "Invalid OTP" });
            }
        } catch (err) {
            setError("root", {
                message: err.response?.data?.message || "Verification failed",
            });
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otpValues];
        newOtp[index] = value.substring(value.length - 1);
        setOtpValues(newOtp);

        setValue("otpCode", newOtp.join(""), { shouldValidate: true });

        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (
            e.key === "Backspace" &&
            !otpValues[index] &&
            index > 0 &&
            inputRefs.current[index - 1]
        ) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
        const newOtp = [...otpValues];

        pastedData.forEach((char, index) => {
            if (index < 6 && !isNaN(char)) {
                newOtp[index] = char;
            }
        });

        setOtpValues(newOtp);
        setValue("otpCode", newOtp.join(""), { shouldValidate: true });

        const nextIndex = Math.min(pastedData.length, 5);
        if (inputRefs.current[nextIndex]) {
            inputRefs.current[nextIndex].focus();
        }
    };

    const handleResendOtp = async () => {
        setTimeLeft(120);
        setEndTime(Date.now() + 120000);
        try {
            await userService.requestEmailChange(newEmail);
            showToast("Code Resent", "success");
        } catch (err) {
            console.error("Resend failed", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Change Email Address</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <form onSubmit={handleSubmit(onRequestOtp)} className="space-y-6">
                            <div className="flex flex-col items-center text-center space-y-2 mb-4">
                                <div className="w-16 h-16 bg-[#fff5eb] text-[#ff5e00] rounded-full flex items-center justify-center mb-2">
                                    <Mail size={32} />
                                </div>
                                <p className="text-gray-500 text-sm">
                                    We'll send a verification code to your new email address.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                        Current Email
                                    </label>
                                    <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-500 font-medium">
                                        {currentEmail}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                        New Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your new email"
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all ${errors.newEmail
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                            : "border-gray-200 focus:border-[#ff5e00] focus:ring-[#ff5e00]/10"
                                            }`}
                                        {...register("newEmail", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: "Invalid email format",
                                            },
                                        })}
                                    />
                                    {errors.newEmail && (
                                        <p className="mt-1 text-xs text-red-500 font-medium">
                                            {errors.newEmail.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {errors.root && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                    {errors.root.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#ff5e00] hover:bg-[#e05200] text-white font-bold rounded-xl shadow-lg shadow-[#ff5e00]/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Send Verification Code
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-8">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-blue-50 text-[#ff5e00] rounded-full flex items-center justify-center">
                                    <ShieldCheck size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900">Verify your email</h4>
                                    <p className="text-gray-500 text-sm">
                                        Enter the 6-digit code sent to <br />
                                        <span className="font-bold text-gray-900">{newEmail}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Hidden input to register the consolidated OTP with RHF */}
                            <input
                                type="hidden"
                                {...register("otpCode", {
                                    required: "Please enter the verification code",
                                    minLength: { value: 6, message: "Please enter all 6 digits" },
                                })}
                            />

                            <div className="flex justify-between gap-2">
                                {otpValues.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className={`w-12 h-14 text-center text-xl font-bold bg-gray-50 border-2 rounded-xl outline-none transition-all ${errors.otpCode
                                            ? "border-red-200 focus:border-red-500 bg-red-50/50"
                                            : "border-transparent focus:border-[#ff5e00] focus:bg-white"
                                            }`}
                                    />
                                ))}
                            </div>

                            {(errors.otpCode || errors.root) && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                    {errors.otpCode?.message || errors.root?.message}
                                </div>
                            )}

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-[#ff5e00] hover:bg-[#e05200] text-white font-bold rounded-xl shadow-lg shadow-[#ff5e00]/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        "Verify & Change Email"
                                    )}
                                </button>

                                <div className="text-center">
                                    {timeLeft > 0 ? (
                                        <p className="text-xs text-gray-400">
                                            Resend code in{" "}
                                            <span className="text-[#ff5e00] font-bold">
                                                {Math.floor(timeLeft / 60)}:
                                                {(timeLeft % 60).toString().padStart(2, "0")}
                                            </span>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="text-sm font-bold text-[#ff5e00] hover:underline transition-all">
                                            Resend Verification Code
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                Use a different email address
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailChangeModal;
