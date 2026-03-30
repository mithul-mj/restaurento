import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react';

const VerifyResult = ({ scanResult, error, isVerifying, reset }) => {
    if (isVerifying) {
        return (
            <motion.div
                key="verifying-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 text-center"
            >
                <RefreshCw size={48} className="text-orange-500 animate-spin mx-auto mb-6" />
                <p className="font-bold text-gray-600 uppercase tracking-widest text-xs">Authenticating...</p>
            </motion.div>
        );
    }

    if (scanResult) {
        return (
            <motion.div
                key="success-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border-2 border-emerald-500 rounded-3xl p-6 space-y-6 max-w-xl mx-auto"
            >
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <CheckCircle size={40} className="text-emerald-500" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Verified</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Entry Granted</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Guest Name</p>
                            <p className="font-bold text-gray-900">{scanResult.name || 'Guest'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Size</p>
                            <p className="font-bold text-gray-900">{scanResult.guests || 0} People</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Pre-order Details</p>
                            <p className="text-sm font-bold text-gray-900">Total: ₹{(scanResult.totalAmount || 0).toFixed(2)}</p>
                        </div>

                        <div className="space-y-2">
                            {scanResult.preOrders && scanResult.preOrders.length > 0 ? (
                                scanResult.preOrders.map((item, idx) => {
                                    const quantity = item.qty || item.quantity || 0;
                                    const price = item.priceAtBooking || item.price || 0;
                                    return (
                                        <div key={idx} className="flex justify-between text-sm bg-gray-50 p-3 rounded-xl">
                                            <span className="font-bold text-gray-700">{quantity}x {item.name}</span>
                                            <span className="text-gray-500">₹{(price * quantity).toFixed(2)}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-center text-gray-400 py-2">No pre-ordered items</p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={reset}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                >
                    Next Guest
                </button>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                key="error-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center border-2 border-red-500 rounded-3xl bg-white max-w-xl mx-auto shadow-lg"
            >
                <XCircle className="text-red-500 mx-auto mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-900">Invalid Ticket</h2>
                <p className="text-red-500 text-sm mt-2 font-bold px-4">{error}</p>
                <button
                    onClick={reset}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold mt-6 shadow-lg active:scale-95 hover:bg-black transition-all"
                >
                    Try Again
                </button>
            </motion.div>
        );
    }

    return null;
};

export default VerifyResult;
