import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full">

                <div className="flex justify-center mb-6">
                    <img src="/LogoWithText.png" alt="Restaurento" className="h-28 w-auto" />
                </div>

                <h1 className="text-9xl font-black text-[#ff5e00] opacity-20 mb-4 select-none">
                    404
                </h1>


                <div className="relative -mt-20 mb-8">
                    <div className="w-48 h-48 bg-[#fff0e3] rounded-full mx-auto flex items-center justify-center relative overflow-hidden">
                        <span className="text-6xl">🍽️</span>
                        <div className="absolute w-full h-8 bg-[#ff5e00] bottom-0 opacity-10"></div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Page Not Found
                </h2>

                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-[#ff5e00] hover:text-[#ff5e00] transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Go Back
                    </button>

                    <Link
                        to="/"
                        className="flex items-center justify-center px-6 py-3 rounded-xl bg-[#ff5e00] text-white font-semibold hover:bg-[#e05200] transition-colors shadow-lg shadow-orange-200"
                    >
                        <Home size={20} className="mr-2" />
                        Back to Home
                    </Link>
                </div>
            </div>


            <div className="mt-16 text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Restaurento
            </div>
        </div>
    );
};

export default NotFound;
