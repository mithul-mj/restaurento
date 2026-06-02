import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Calendar,
    Clock,
    Users,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlarmClock
} from "lucide-react";
import { useBookings } from "../../hooks/useBookings";
import { showConfirm } from "../../utils/alert";
import { formatDate, formatTime12Hour } from "../../utils/timeUtils";
import Loader from "../../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import RatingModal from "../../components/user/RatingModal";

const MyBookings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || "upcoming");
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
                theme: { color: "#ff5e00" },
                retry: { enabled: false }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                setRetryingBookingId(null);
                window.location.href = `/payment-failed/${booking._id}`;
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
                <h1 className="text-lg font-semibold text-gray-900 mb-6">My Bookings</h1>

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
                            <h3 className="text-base font-semibold text-gray-900 mb-1">No bookings found</h3>
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

const AddToCalendarButton = ({ booking, restaurant }) => {
    const getDates = () => {
        const startTotalMinutes = booking.slotTime;
        const startH = Math.floor(startTotalMinutes / 60);
        const startM = startTotalMinutes % 60;

        const startDate = new Date(booking.bookingDate);
        startDate.setHours(startH, startM, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 2);

        const formatICSDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');

        return {
            startIcs: formatICSDate(startDate),
            endIcs: formatICSDate(endDate)
        };
    };

    const openGoogleCalendar = () => {
        const { startIcs, endIcs } = getDates();
        const title = encodeURIComponent(`Dining at ${restaurant?.restaurantName || 'Restaurant'}`);
        const details = encodeURIComponent(`Table reservation for ${booking.guests} guests.`);
        const location = encodeURIComponent(restaurant?.address || restaurant?.restaurantName || '');
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIcs}/${endIcs}&details=${details}&location=${location}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={openGoogleCalendar}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 rounded-xl hover:bg-orange-50 hover:text-[#ff5e00] transition-colors"
            title="Add to Google Calendar"
        >
            <AlarmClock size={18} />
        </button>
    );
};

const BookingCard = ({ booking, onCancel, onRetry, onRate, isCanceling, retryingBookingId, type }) => {
    const restaurant = booking.restaurant;
    const isCanceled = booking.status === "canceled";
    const isPending = booking.status === "pending-payment";
    const isCheckedIn = booking.status === "checked-in";
    const isApproved = booking.status === "approved";

    const statusConfig = {
        "approved": { label: "Confirmed", classes: "bg-green-50 text-green-600 border-green-100" },
        "checked-in": { label: "Completed", classes: "bg-blue-50 text-blue-600 border-blue-100" },
        "pending-payment": { label: "Payment Failed", classes: "bg-red-50 text-red-500 border-red-100 animate-pulse" },
        "canceled": { label: booking.canceledBy === "RESTAURANT" ? "Cancelled by restaurant" : "Cancelled by you", classes: booking.canceledBy === "RESTAURANT" ? "bg-orange-50 text-[#ff5e00] border-orange-100" : "bg-gray-100 text-gray-500 border-gray-200" },
    };
    const status = statusConfig[booking.status];

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative sm:w-44 md:w-52 h-44 sm:h-auto shrink-0 overflow-hidden bg-gray-100">
                    <img
                        src={restaurant?.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?q=80&w=400&auto=format&fit=crop"}
                        alt={restaurant?.restaurantName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {status && (
                        <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${status.classes}`}>
                            {isCheckedIn && <CheckCircle2 size={10} />}
                            {isPending && <XCircle size={10} />}
                            {isApproved && <CheckCircle2 size={10} />}
                            {status.label}
                        </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                        <span className="text-[9px] font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            #{booking._id.slice(-6).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 leading-tight mb-0.5">
                                {restaurant?.restaurantName}
                            </h3>
                            <p className="text-xs font-medium text-gray-400">
                                {formatDate(booking.bookingDate, { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                        {!isCanceled && isApproved && type === 'upcoming' && (
                            <AddToCalendarButton booking={booking} restaurant={restaurant} />
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                            <Clock size={12} className="text-[#ff5e00]" />
                            <span className="text-xs font-medium text-gray-600">{formatTime12Hour(booking.slotTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                            <Users size={12} className="text-[#ff5e00]" />
                            <span className="text-xs font-medium text-gray-600">{booking.guests} Guests</span>
                        </div>
                        {booking.totalAmount > 0 && (
                            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                                <span className="text-xs font-medium text-gray-600">Rs.{booking.totalAmount.toFixed(0)} paid</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 border-t border-gray-50">
                        <div className="flex flex-wrap gap-2 flex-1">
                            {isCheckedIn && (
                                <button onClick={onRate} className="px-4 py-2 bg-orange-50 text-[#ff5e00] font-semibold text-xs rounded-xl hover:bg-orange-100 transition-all active:scale-95">
                                    Rate
                                </button>
                            )}
                            {isPending && (
                                <button
                                    onClick={onRetry}
                                    disabled={retryingBookingId !== null || isCanceling}
                                    className={`px-4 py-2 bg-[#ff5e00] text-white font-semibold text-xs rounded-xl transition-all active:scale-95 ${(retryingBookingId !== null || isCanceling) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e05200]'}`}
                                >
                                    {retryingBookingId === booking._id ? "Starting..." : "Retry Payment"}
                                </button>
                            )}
                            {!isCanceled && isApproved && type !== 'past' && (
                                <button
                                    onClick={onCancel}
                                    disabled={isCanceling || retryingBookingId !== null}
                                    className="px-4 py-2 text-gray-400 font-semibold text-xs rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            )}
                            {isCanceled && (
                                <Link
                                    to={`/restaurants/${restaurant._id}`}
                                    state={{
                                        prefilledGuests: booking.guests,
                                        prefilledCart: booking.preOrderItems?.reduce((acc, item) => ({
                                            ...acc,
                                            [item.dishId]: { _id: item.dishId, name: item.name, price: item.priceAtBooking, qty: item.qty }
                                        }), {}) || {}
                                    }}
                                    className="px-4 py-2 bg-orange-50 text-[#ff5e00] font-semibold text-xs rounded-xl hover:bg-orange-100 transition-colors"
                                >
                                    Rebook
                                </Link>
                            )}
                        </div>
                        <Link
                            to={`/my-bookings/${booking._id}`}
                            className="px-5 py-2 bg-[#ff5e00] text-white font-semibold text-xs rounded-xl shadow-sm shadow-orange-100 hover:bg-[#e05200] transition-all active:scale-95 shrink-0"
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
