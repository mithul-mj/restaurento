import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = ({
    children,
    title,
    subtitle,
    image = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
    reverse = false
}) => {
    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-white">

            <div className={`hidden md:block md:w-1/2 lg:w-1/2 relative bg-gray-900 ${reverse ? 'order-2' : ''}`}>
                <img
                    src={image}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>


            <div className={`w-full md:w-1/2 lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto relative ${reverse ? 'order-1' : ''}`}>


                <div className="absolute inset-0 z-0 md:hidden">
                    <img
                        src={image}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/70"></div>
                </div>

                <div className="w-full max-w-[450px] relative z-10">

                    <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                        <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center">
                            <UtensilsCrossed size={20} />
                        </div>
                        <span className="font-bold text-xl text-white md:text-gray-900">Restauranto</span>
                    </div>

                    <h1 className="text-3xl font-extrabold text-white md:text-gray-900 mb-2 text-center md:text-left">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-gray-300 md:text-gray-500 text-sm mb-8 text-center md:text-left font-normal">
                            {subtitle}
                        </p>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
