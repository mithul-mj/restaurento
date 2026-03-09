import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    Users,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    MapPin,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { useBookings } from "../../hooks/useBookings";
import { showConfirm } from "../../utils/alert";
import { formatDate, formatTime12Hour } from "../../utils/timeUtils";
import Loader from "../../components/Loader";
import { motion, AnimatePresence } from "framer-motion";

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [page, setPage] = useState(1);
    const limit = 3;

    const { data, isLoading, isError, cancelBooking, isCanceling } = useBookings({
        type: activeTab,
        page,
        limit,
    });

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
                <h1 className="text-3xl font-black text-gray-900 mb-6">My Bookings</h1>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-100">
                    {["upcoming", "past"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? "text-[#ff5e00]" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab}
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
                            <p className="text-sm text-gray-500">You don't have any {activeTab} bookings at the moment.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400">
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
            </main>
        </div>
    );
};

const BookingCard = ({ booking, onCancel, isCanceling, type }) => {
    const restaurant = booking.restaurant;
    const isCanceled = booking.status === "canceled";

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
                            <h3 className="text-xl font-black text-gray-900 leading-none">
                                {restaurant?.restaurantName}
                            </h3>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isCanceled
                                ? "bg-red-50 text-red-500 border border-red-100"
                                : "bg-green-50 text-green-600 border border-green-100"
                                }`}>
                                {isCanceled ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                                {booking.status}
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
                        {type === "upcoming" && !isCanceled && (
                            <button
                                onClick={onCancel}
                                disabled={isCanceling}
                                className="px-6 py-2.5 bg-gray-50 text-gray-600 font-bold text-xs rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                Cancel Booking
                            </button>
                        )}
                        <button className="px-6 py-2.5 bg-[#ff5e00] text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-100 hover:bg-[#e05200] transition-all">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
