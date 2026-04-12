import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

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
        console.log('OTP Submitted:', data);
    };

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-white">
            <div className="hidden md:block md:w-1/2 lg:w-1/2 relative bg-gray-900">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                    alt="Gourmet Food"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/30"></div>
            </div>


            <div className="w-full md:w-1/2 lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative">


                <div className="absolute inset-0 z-0 md:hidden">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>


                <div className="w-full max-w-[450px] relative z-10 bg-white md:bg-transparent rounded-2xl p-8 md:p-0 shadow-2xl md:shadow-none">
                    <div className="flex justify-center mb-10">
                        <img
                            src="/LogoWithText.png"
                            alt="Restaurento"
                            className="h-12 w-auto md:brightness-100 brightness-0 invert"
                        />
                    </div>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 md:text-gray-900 mb-2">
                            Verify Your Email
                        </h1>
                        <p className="text-gray-500 text-sm">
                            We've sent a 6-digit code to <span className="font-semibold text-gray-700">user-email@example.com</span>
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
                                />
                            ))}
                        </div>


                        <input
                            type="hidden"
                            {...register("otp", {
                                required: "Please enter the verification code",
                                minLength: { value: 6, message: "Code must be 6 digits" }
                            })}
                        />
                        {errors.otp && <p className="text-red-500 text-center text-sm">{errors.otp.message}</p>}

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-lg font-bold text-base transition-colors shadow-lg shadow-orange-200"
                        >
                            Verify
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            <span>Back</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
