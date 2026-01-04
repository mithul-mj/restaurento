import React, { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createPortal } from 'react-dom';

const VerifyEmailModal = ({ email, onClose, onVerify }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [localError, setLocalError] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm();


    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        setValue("otp", newOtp.join(""));

        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };


    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const onSubmit = (data) => {
        setLocalError("");
        if (data.otp.length !== 6) {
            setLocalError("Please enter a complete 6-digit code");
            return;
        }
        onVerify(data.otp);
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-[450px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Verify Your Email
                    </h2>
                    <p className="text-gray-500 text-sm">
                        We've sent a 6-digit code to <span className="font-semibold text-gray-700">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-10 h-12 sm:w-12 sm:h-14 border border-gray-300 rounded-lg text-center text-xl font-bold text-gray-800 focus:border-[#ff5e00] focus:ring-1 focus:ring-[#ff5e00] outline-none transition-all bg-white"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    <input
                        type="hidden"
                        {...register("otp", { required: true })}
                    />

                    {(errors.otp || localError) && (
                        <p className="text-red-500 text-center text-sm">
                            {localError || "Please enter the verification code"}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-lg font-bold text-base transition-colors shadow-lg shadow-orange-200"
                    >
                        Verify
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                </div>
            </div>
        </div>
    );
    return createPortal(modalContent, document.getElementById("modal-root"))
};

export default VerifyEmailModal;
