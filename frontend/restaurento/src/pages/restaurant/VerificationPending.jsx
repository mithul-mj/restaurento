import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { XCircle, AlertCircle, ArrowRight, Ban, LogOut } from 'lucide-react';
import restaurantService from '../../services/restaurant.service';
import authService from '../../services/auth.service';
import { logout } from '../../redux/slices/authSlice';

const VerificationPending = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [rejectionReason, setRejectionReason] = useState(null);

    useEffect(() => {
        if (user?.verificationStatus === 'rejected' || user?.verificationStatus === 'banned') {
            const fetchReason = async () => {
                try {
                    const { restaurant } = await restaurantService.getProfile();
                    if (restaurant.verificationHistory?.length > 0) {
                        const latestEntry = restaurant.verificationHistory[restaurant.verificationHistory.length - 1];
                        if (latestEntry) {
                            setRejectionReason(latestEntry.reason);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch rejection reason", e);
                }
            };
            fetchReason();
        }
    }, [user]);

    const isRejected = user?.verificationStatus === 'rejected';
    const isBanned = user?.verificationStatus === 'banned';

    const handleSignOut = async () => {
        try {
            await authService.logout("RESTAURANT");
            dispatch(logout());
            navigate('/restaurant/login');
        } catch (error) {
            console.error("Logout failed:", error);
            dispatch(logout());
            navigate('/restaurant/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6 text-center">

            <div className="flex justify-center mb-8 animate-fade-in-down">
                <img
                    src="/LogoWithText.png"
                    alt="Restaurento"
                    className="h-12 w-auto"
                />
            </div>

            {isBanned ? (
                <div className="max-w-2xl animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <Ban className="text-red-600" size={40} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                        Account Suspended
                    </h1>

                    <div className="bg-red-50 border border-red-100 p-6 rounded-2xl mb-8 text-left max-w-lg mx-auto">
                        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                            <AlertCircle size={18} />
                            Notice:
                        </h3>
                        <p className="text-red-700 leading-relaxed font-medium mb-4">
                            Your account has been permanently suspended due to repeated verification failures or policy violations.
                        </p>
                        {rejectionReason && (
                            <div className="pt-4 border-t border-red-200">
                                <h4 className="font-bold text-red-800 text-sm mb-1">Reason for Ban:</h4>
                                <p className="text-red-600 text-sm italic">"{rejectionReason}"</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-200 hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto"
                    >
                        Logout
                        <LogOut size={20} />
                    </button>
                </div>
            ) : isRejected ? (
                <div className="max-w-2xl animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="text-red-500" size={40} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                        Your Restaurant details are being<br className="hidden md:block" /> verified by Admin!
                    </h1>

                    <p className="text-gray-500 text-lg font-medium">
                        The admin will respond within 24 hrs after the submission.
                    </p>

                    <div className="mt-12 flex justify-center">
                        <div className="relative">
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center animate-pulse overflow-hidden p-4">
                                <img src="/log.png" alt="Restaurento" className="w-full h-full object-contain" />
                            </div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#ff5e00]/20 rounded-full animate-spin-slow" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute bottom-6 text-gray-400 text-xs font-medium">
                &copy; {new Date().getFullYear()} Restaurento Inc.
            </div>
        </div>
    );
};

export default VerificationPending;
