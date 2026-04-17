import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock,
    Users,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { useBookings } from "../../hooks/useBookings";
import { showConfirm } from "../../utils/alert";
import { formatDate, formatTime12Hour } from "../../utils/timeUtils";
import Loader from "../../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import RatingModal from "../../components/user/RatingModal";

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [page, setPage] = useState(1);
    const limit = 2;

    const [retryingBookingId, setRetryingBookingId] = useState(null);
    const [ratingModal, setRatingModal] = useState({ isOpen: false, restaurantId: null, restaurantName: "" });

    const { 
        data, 
        isLoading, 
        isError, 
        cancelBooking, 
        isCanceling, 
        checkBookingAvailability, 
        verifyRazorpayPayment,
        retryBookingPayment 
    } = useBookings({
        type: activeTab,
        page,
        limit,
    });

    const handleRetryPayment = async (booking) => {
        if (retryingBookingId) return;
        setRetryingBookingId(booking._id);

        try {
            // 1. Pre-check availability
            await checkBookingAvailability(booking._id);

            // 2. Refresh the Razorpay order (handles expiration & wallet adjustment)
            const retryRes = await retryBookingPayment(booking._id);
            if (!retryRes.success || !retryRes.order) {
                throw new Error(retryRes.message || "Failed to refresh payment order.");
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: retryRes.order.amount,
                currency: retryRes.order.currency,
                name: "Restaurento",
                description: "Complete your table booking",
                order_id: retryRes.order.id,
                modal: {
                    ondismiss: () => setRetryingBookingId(null)
                },
                handler: async function (rzpResponse) {
                    try {
                        const verifyRes = await verifyRazorpayPayment({
                            razorpay_order_id: rzpResponse.razorpay_order_id,
                            razorpay_payment_id: rzpResponse.razorpay_payment_id,
                            razorpay_signature: rzpResponse.razorpay_signature
                        });

                        if (verifyRes.success) {
                            showConfirm("Payment Success", "Your booking has been confirmed!", "Great").then(() => {
                                window.location.reload();
                            });
                        } else {
                            setRetryingBookingId(null);
                            showConfirm("Payment Action Required", verifyRes.message || "Something went wrong.", "OK");
                        }
                    } catch (err) {
                        setRetryingBookingId(null);
                        const errorMessage = err.response?.data?.message || "Payment verification failed.";
                        showConfirm("Verification Failed", errorMessage, "OK");
                    }
                },
                theme: { color: "#ff5e00" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                setRetryingBookingId(null);
                showConfirm("Payment Failed", "The retry attempt was unsuccessful.", "OK");
            });
            rzp.open();
        } catch (error) {
            console.error("Retry error:", error);
            setRetryingBookingId(null);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader size="lg" showText={true} text="Fetching your bookings..." />
            </div>
        );
    }

    const bookings = data?.data || [];
    const meta = data?.meta || { totalCount: 0, currentPage: 1, totalPages: 1 };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-100">
                    {["upcoming", "pending", "past", "canceled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? "text-[#ff5e00]" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab === "pending" ? "Failed Payments" : tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5e00]"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </header>

            <main className="space-y-6">
                <AnimatePresence mode="wait">
                    {bookings.length > 0 ? (
                        <motion.div
                            key={activeTab + page}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {bookings.map((booking) => (
                                <BookingCard
                                    key={booking._id}
                                    booking={booking}
                                    onCancel={() => {
                                        showConfirm(
                                            "Cancel Booking?",
                                            "Are you sure you want to cancel this booking? This action cannot be undone.",
                                            "Yes, Cancel"
                                        ).then((result) => {
                                            if (result.isConfirmed) {
                                                cancelBooking(booking._id);
                                            }
                                        });
                                    }}
                                    onRetry={() => handleRetryPayment(booking)}
                                    onRate={() => setRatingModal({ 
                                        isOpen: true, 
                                        restaurantId: booking.restaurantId?._id || booking.restaurantId, 
                                        restaurantName: booking.restaurant?.restaurantName 
                                    })}
                                    retryingBookingId={retryingBookingId}
                                    isCanceling={isCanceling}
                                    type={activeTab}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200"
                        >
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No bookings found</h3>
                            <p className="text-sm text-gray-500">
                                {activeTab === "pending"
                                    ? "Good news! You have no failed or pending payments."
                                    : `You don't have any ${activeTab} bookings at the moment.`
                                }
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400">
                            Page {meta.currentPage} of {meta.totalPages}
                        </p>
                        <div className="flex gap-3">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <button
                                disabled={page >= meta.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}
                {/* Rating Modal */}
                <RatingModal 
                    isOpen={ratingModal.isOpen} 
                    onClose={() => setRatingModal({ ...ratingModal, isOpen: false })} 
                    restaurantId={ratingModal.restaurantId}
                    restaurantName={ratingModal.restaurantName}
                />
            </main>
        </div>
    );
};

const BookingCard = ({ booking, onCancel, onRetry, onRate, isCanceling, retryingBookingId, type }) => {
    const restaurant = booking.restaurant;
    const isCanceled = booking.status === "canceled";
    const isPending = booking.status === "pending-payment";

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-100 border border-gray-50">
                    <img
                        src={restaurant?.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?q=80&w=400&auto=format&fit=crop"}
                        alt={restaurant?.restaurantName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900 leading-none">
                                {restaurant?.restaurantName}
                            </h3>
                            <div className="flex flex-col items-end gap-1">
                                {booking.status === 'checked-in' && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                                        <CheckCircle2 size={12} />
                                        Completed
                                    </div>
                                )}
                                {isPending && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 animate-pulse">
                                        <XCircle size={12} />
                                        Payment Failed
                                    </div>
                                )}
                                {isCanceled && (
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${booking.canceledBy === 'RESTAURANT' ? 'bg-orange-50 text-[#ff5e00]' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {booking.canceledBy === 'RESTAURANT' ? 'Cancelled by restaurant' : 'Cancelled by you'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={14} className="text-[#ff5e00]" />
                                <span className="text-xs font-bold">{formatDate(booking.bookingDate, { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock size={14} className="text-[#ff5e00]" />
                                <span className="text-xs font-bold">{formatTime12Hour(booking.slotTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Users size={14} className="text-[#ff5e00]" />
                                <span className="text-xs font-bold">{booking.guests} Guests</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 items-center justify-end border-t border-gray-50 pt-5">
                        {booking.status === 'checked-in' && (
                            <button
                                onClick={onRate}
                                className="px-6 py-2.5 bg-orange-50 text-[#ff5e00] font-black text-xs rounded-xl hover:bg-orange-100 transition-all active:scale-95"
                            >
                                Rate Restaurant
                            </button>
                        )}
                        {isPending && (
                            <button
                                onClick={onRetry}
                                disabled={retryingBookingId !== null || isCanceling}
                                className={`px-6 py-2.5 bg-orange-500 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-200 transition-all transform active:scale-95 ${(retryingBookingId !== null || isCanceling) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                                    }`}
                            >
                                {retryingBookingId === booking._id ? "Starting..." : "Retry Payment"}
                            </button>
                        )}
                        {!isCanceled && booking.status === 'approved' && (
                            <button
                                onClick={onCancel}
                                disabled={isCanceling || retryingBookingId !== null}
                                className="px-6 py-2.5 bg-gray-50 text-gray-600 font-bold text-xs rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel Booking
                            </button>
                        )}
                        {isCanceled && (
                            <Link
                                to={`/restaurants/${restaurant._id}`}
                                state={{
                                    prefilledGuests: booking.guests,
                                    prefilledCart: booking.preOrderItems?.reduce((acc, item) => ({
                                        ...acc,
                                        [item.dishId]: {
                                            _id: item.dishId,
                                            name: item.name,
                                            price: item.priceAtBooking,
                                            qty: item.qty
                                        }
                                    }), {}) || {}
                                }}
                                className="px-6 py-2.5 bg-orange-50 text-[#ff5e00] font-bold text-xs rounded-xl hover:bg-orange-100 transition-colors"
                            >
                                Rebook
                            </Link>
                        )}
                        <Link
                            to={`/my-bookings/${booking._id}`}
                            className="px-6 py-2.5 bg-[#ff5e00] text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-100 hover:bg-[#e05200] transition-all"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
