import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import restaurantService from '../../services/restaurant.service';

const VerificationPending = () => {
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [rejectionReason, setRejectionReason] = useState(null);

    useEffect(() => {
        if (user?.verificationStatus === 'rejected') {
            const fetchReason = async () => {
                try {
                    const { restaurant } = await restaurantService.getProfile();
                    setRejectionReason(restaurant.rejectionReason);
                } catch (e) {
                    console.error("Failed to fetch rejection reason", e);
                }
            };
            fetchReason();
        }
    }, [user]);

    const isRejected = user?.verificationStatus === 'rejected';

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6 text-center">

            {/* Logo Section */}
            <div className="flex items-center gap-2 mb-8 animate-fade-in-down">
                <div className="w-8 h-8 bg-[#ff5e00] rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
                    <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">Restauranto</span>
            </div>

            {/* Main Content */}
            {isRejected ? (
                <div className="max-w-2xl animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="text-red-500" size={40} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                        Application Action Required
                    </h1>

                    <div className="bg-red-50 border border-red-100 p-6 rounded-2xl mb-8 text-left max-w-lg mx-auto">
                        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                            <AlertCircle size={18} />
                            Reason for Rejection:
                        </h3>
                        <p className="text-red-700 leading-relaxed font-medium">
                            {rejectionReason || "Please review your application details and documents."}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/restaurant/pre-approval')}
                        className="px-8 py-4 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-200 hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto"
                    >
                        Edit Application
                        <ArrowRight size={20} />
                    </button>
                </div>
            ) : (
                <div className="max-w-2xl animate-fade-in-up">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                        Your Restaurant details are being<br className="hidden md:block" /> verified by Admin!
                    </h1>

                    <p className="text-gray-500 text-lg font-medium">
                        The admin will respond within 24 hrs after the submission.
                    </p>

                    {/* Subtle Pulse Animation for 'waiting' status */}
                    <div className="mt-12 flex justify-center">
                        <div className="relative">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
                                <UtensilsCrossed className="text-[#ff5e00]" size={32} />
                            </div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#ff5e00]/20 rounded-full animate-spin-slow" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer / Copyright */}
            <div className="absolute bottom-6 text-gray-400 text-xs font-medium">
                &copy; {new Date().getFullYear()} Restauranto Inc.
            </div>
        </div>
    );
};

export default VerificationPending;
