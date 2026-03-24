import React from 'react';
import { X, Calendar, User, Store, DollarSign, Tag, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { useTransactionDetails } from '../../../hooks/usePayments';

const TransactionDetailsModal = ({ isOpen, onClose, transactionId }) => {
    const { data: transaction, isLoading } = useTransactionDetails(transactionId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="relative p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-100 text-[#ff5e00] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200 shadow-sm">
                            Booking Receipt
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-full text-gray-400 hover:text-gray-900 transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">#{transactionId?.slice(-8).toUpperCase()}</h3>
                    <p className="text-gray-500 font-medium text-sm">Full transaction details for this booking.</p>
                </div>

                <div className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-gray-100 rounded-full w-1/4"></div>
                                        <div className="h-6 bg-gray-100 rounded-lg w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : transaction ? (
                        <>
                            {/* Grid 1: Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1 group">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <User size={14} className="group-hover:text-[#ff5e00] transition-colors" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Customer</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 tracking-tight">{transaction.userId?.fullName}</p>
                                    <p className="text-xs text-gray-400 font-medium">{transaction.userId?.email}</p>
                                </div>
                                <div className="space-y-1 group">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Store size={14} className="group-hover:text-[#ff5e00] transition-colors" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Restaurant</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 tracking-tight">{transaction.restaurantId?.restaurantName}</p>
                                    <p className="text-xs text-gray-400 font-medium">{transaction.restaurantId?.address}</p>
                                </div>
                                <div className="space-y-1 group">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Calendar size={14} className="group-hover:text-[#ff5e00] transition-colors" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Date & Time</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 tracking-tight">{dayjs(transaction.bookingDate).format('DD MMM YYYY')}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                        <Clock size={12} />
                                        <span>Slot Start (Mins): {transaction.slotTime}</span>
                                    </div>
                                </div>
                                <div className="space-y-1 group">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <DollarSign size={14} className="group-hover:text-[#ff5e00] transition-colors" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Payment Status</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${transaction.razorpayPaymentId ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {transaction.razorpayPaymentId ? 'Paid Full' : 'Refunding/Canceled'}
                                        </span>
                                        {transaction.razorpayPaymentId && (
                                            <p className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
                                                ID: {transaction.razorpayPaymentId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Items Breakdown */}
                            {transaction.preOrderItems?.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Ordered Items</h4>
                                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                                        {transaction.preOrderItems.map((item, idx) => (
                                            <div key={idx} className="p-4 flex justify-between items-center border-b border-gray-100 last:border-0 hover:bg-white transition-colors group">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-white border border-gray-200 p-2 rounded-lg text-xs font-bold text-gray-600 group-hover:border-[#ff5e00]/30 transition-colors">
                                                        {item.qty}x
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 tracking-tight">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium tracking-wide italic">₹{item.priceAtBooking} per unit</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900 tracking-tight">₹{item.qty * item.priceAtBooking}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Summary & Fees */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Financial Breakdown</h4>
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Slot Price (x{transaction.guests})</span>
                                        <span className="text-gray-900 font-bold tracking-tight">₹{transaction.slotPrice * transaction.guests}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Items Total</span>
                                        <span className="text-gray-900 font-bold tracking-tight">₹{transaction.preOrderItems?.reduce((sum, item) => sum + (item.qty * item.priceAtBooking), 0) || 0}</span>
                                    </div>
                                    {transaction.appliedCoupon?.discountAmountApplied > 0 && (
                                        <div className="flex justify-between text-sm text-[#ff5e00] bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 animate-pulse-subtle">
                                            <div className="flex items-center gap-2">
                                                <Tag size={12} />
                                                <span className="font-bold tracking-tight">Coupon ({transaction.appliedCoupon.code})</span>
                                            </div>
                                            <span className="font-bold">-₹{transaction.appliedCoupon.discountAmountApplied}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-gray-50" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Tax & Platform Fee</span>
                                        <span className="text-gray-900 font-bold tracking-tight">₹{(transaction.tax + transaction.platformFee).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow-lg border border-gray-800">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff5e00]">Final Amount</span>
                                                <span className="text-xs text-blue-300 font-medium">Platform Earned: ₹{(transaction.tax + transaction.platformFee).toFixed(2)}</span>
                                            </div>
                                            <span className="text-2xl font-bold tracking-tight">₹{transaction.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-center">
                            <h3 className="text-lg font-bold text-gray-900">Transaction Not Found</h3>
                            <p className="text-gray-500 mt-2">The details for this transaction are not available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsModal;
