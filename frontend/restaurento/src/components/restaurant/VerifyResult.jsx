import React from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle, 
    RefreshCw, 
    XCircle, 
    Mail, 
    CircleDashed 
} from 'lucide-react';
import { formatDate, formatTime12Hour } from '../../utils/timeUtils';

const VerifyResult = ({ scanResult, error, isVerifying, reset }) => {
    if (isVerifying) {
        return (
            <motion.div
                key="verifying-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-40 text-center"
            >
                <div className="relative w-20 h-20 mx-auto mb-8">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute inset-0 border-4 border-orange-100 border-t-orange-500 rounded-full"
                    />
                    <CircleDashed size={32} className="text-orange-500 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-sm font-black text-gray-900 uppercase tracking-[0.3em]">Validating Ticket</p>
                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Checking secure database</p>
            </motion.div>
        );
    }

    if (scanResult) {
        const preOrderItems = scanResult.preOrders || [];
        const subtotal = preOrderItems.reduce((acc, item) => acc + (item.priceAtBooking * item.qty), 0) || 0;
        const seatTotal = (scanResult.guests || 0) * (scanResult.slotPrice || 0);
        const total = scanResult.totalAmount || (subtotal + seatTotal + (scanResult.tax || 0) + (scanResult.platformFee || 0));

        return (
            <motion.div
                key="success-ui"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto py-8 px-4"
            >
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden font-sans">
                    {/* Brand Status Header */}
                    <div className="bg-orange-50 px-8 py-6 flex items-center gap-4 border-b border-orange-100">
                        <div className="bg-[#ff5e00] p-2 rounded-full">
                            <CheckCircle size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black font-outfit text-gray-900 tracking-tight">Verified</h2>
                            <p className="text-[10px] font-black text-[#ff5e00] uppercase tracking-[0.2em]">Authentic Reservation</p>
                        </div>
                    </div>

                    <div className="p-10 space-y-10">
                        {/* Essential Info Grid */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Lead Guest</p>
                                <h3 className="text-3xl font-black font-outfit text-gray-900 leading-tight">{scanResult.name || 'Guest'}</h3>
                                <p className="text-xs text-gray-400 mt-1.5 font-medium">{scanResult.email || 'N/A'}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1 border-l border-gray-50 pl-0 sm:pl-8">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Schedule</p>
                                <p className="text-xl font-black text-gray-900 font-outfit">
                                    {scanResult.bookingDate ? formatDate(scanResult.bookingDate, { month: 'long', day: 'numeric' }) : 'N/A'}
                                </p>
                                <p className="text-sm font-black text-[#ff5e00] mt-0.5">
                                    {scanResult.slotTime !== undefined ? formatTime12Hour(scanResult.slotTime) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-6 pt-10 border-t border-gray-50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{scanResult.guests} Guests • Pre-Order list</h4>
                                <span className="bg-gray-100 text-[10px] font-black text-gray-400 px-3 py-1 rounded-full uppercase tracking-tighter">Verified</span>
                            </div>
                            
                            <div className="space-y-4">
                                {preOrderItems.length > 0 ? (
                                    preOrderItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-4">
                                                <span className="text-orange-500 font-black w-6 text-xs bg-orange-50 h-6 flex items-center justify-center rounded">x{item.qty}</span>
                                                <span className="text-gray-700 font-bold tracking-tight uppercase text-xs">{item.name}</span>
                                            </div>
                                            <span className="text-gray-900 font-black tracking-tighter">₹{((item.priceAtBooking || 0) * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 font-bold italic py-4 text-center border-2 border-dashed border-gray-50 rounded-2xl">No pre-ordered menu items</p>
                                )}
                            </div>

                            {/* Summary Box */}
                            <div className="bg-gray-50 rounded-[2rem] p-8 space-y-4">
                                <div className="space-y-2.5">
                                    <div className="flex justify-between text-[10px] text-gray-400 font-black uppercase tracking-wider">
                                        <span>Seat Reservation Fee</span>
                                        <span className="text-gray-900">₹{seatTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 font-black uppercase tracking-wider">
                                        <span>Taxes & Service</span>
                                        <span className="text-gray-900">₹{(Number(scanResult.tax || 0) + Number(scanResult.platformFee || 0)).toFixed(2)}</span>
                                    </div>
                                    
                                    {scanResult.discountAmount > 0 && (
                                        <div className="flex justify-between text-[10px] text-[#ff5e00] font-black uppercase tracking-wider pt-1">
                                            <span>Privilege Discount ({scanResult.couponCode || 'PROMO'})</span>
                                            <span>- ₹{scanResult.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-5 border-t border-gray-200">
                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Total Amount Paid</span>
                                    <span className="text-4xl font-black text-gray-900 tracking-tighter font-outfit">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={reset}
                            className="w-full py-6 bg-[#ff5e00] text-white rounded-[2rem] font-black text-xl hover:shadow-[0_20px_40px_rgba(255,94,0,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
                        >
                            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                            Next Reservation
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                key="error-ui"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto py-20 px-4"
            >
                <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-red-50 shadow-2xl">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <XCircle size={48} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Invalid Ticket</h2>
                    <p className="text-xs text-gray-400 font-bold mb-10 uppercase tracking-widest leading-relaxed px-4">{error}</p>
                    <button
                        onClick={reset}
                        className="w-full py-5 bg-red-500 text-white rounded-3xl font-black text-lg hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-[0.98]"
                    >
                        Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    return null;
};

export default VerifyResult;
