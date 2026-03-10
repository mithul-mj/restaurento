import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Phone,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Navigation,
    AlertCircle,
    ChevronRight,
    Info,
    Receipt,
    QrCode,
    Mail
} from "lucide-react";
import { useBookingDetails, useBookings } from "../../hooks/useBookings";
import { formatDate, formatTime12Hour } from "../../utils/timeUtils";
import Loader from "../../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { showConfirm } from "../../utils/alert";
import { QRCodeSVG } from "qrcode.react";

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useBookingDetails(id);
    const { cancelBooking, isCanceling } = useBookings({});

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fcfcfc]">
                <Loader size="lg" showText={true} text="Verifying your reservation..." />
            </div>
        );
    }

    if (isError || !data?.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfcfc] px-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Booking Not Found</h2>
                <p className="text-gray-500 mb-8 text-center max-w-md">We couldn't retrieve this booking. It might have been deleted or the link is invalid.</p>
                <Link to="/my-bookings" className="px-8 py-3 bg-[#ff5e00] text-white rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-[#e05200] transition-all">
                    View My Bookings
                </Link>
            </div>
        );
    }

    const booking = data.data;
    const restaurant = booking.restaurant;
    const isCanceled = booking.status === "canceled";
    const isPast = new Date(booking.bookingDate) < new Date();

    const handleCancel = () => {
        showConfirm(
            "Cancel Booking?",
            "Are you sure you want to cancel this booking? This action cannot be undone.",
            "Yes, Cancel"
        ).then((result) => {
            if (result.isConfirmed) {
                cancelBooking(booking._id);
            }
        });
    };

    const bookingIdShort = booking._id.slice(-8).toUpperCase();

    // Price calculations
    const slotPrice = booking.slotPrice || restaurant?.slotPrice || 0;
    const bookingFee = slotPrice * booking.guests;
    const preOrderTotal = booking.preOrderItems.reduce((acc, item) => acc + (item.priceAtBooking * item.qty), 0);
    const tax = booking.tax;
    const platformFee = booking.platformFee;
    const totalPaid = booking.totalAmount;

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20">
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 px-2">
                    <Link to="/" className="hover:text-[#ff5e00] transition-colors font-medium">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/my-bookings" className="hover:text-[#ff5e00] transition-colors font-medium">My Bookings</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-bold truncate">#BK{bookingIdShort}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: 8/12 */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Restaurant Info Card */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className="w-48 h-48 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-50">
                                {restaurant?.images?.[0] && (
                                    <img
                                        src={restaurant.images[0]}
                                        alt={restaurant.restaurantName}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 space-y-4 py-2">
                                <h1 className="text-3xl font-bold text-gray-900">{restaurant?.restaurantName}</h1>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 justify-center md:justify-start">
                                        <MapPin className="text-gray-400 shrink-0 mt-0.5" size={18} />
                                        <p className="text-sm font-medium text-gray-500 max-w-md">{restaurant?.address}</p>
                                    </div>
                                    {restaurant?.restaurantPhone && (
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <Phone className="text-gray-400 shrink-0" size={18} />
                                            <p className="text-sm font-medium text-gray-500">{restaurant.restaurantPhone}</p>
                                        </div>
                                    )}
                                    {restaurant?.email && (
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <Mail className="text-gray-400 shrink-0" size={18} />
                                            <a
                                                href={`mailto:${restaurant.email}?subject=Inquiry regarding Booking #BK${bookingIdShort}`}
                                                className="text-sm font-medium text-red-900 hover:underline"
                                            >
                                                {restaurant.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Booking Details Card */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">Booking Details</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 shrink-0">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">
                                                <span className="text-gray-400 font-medium mr-1">Date:</span>
                                                {formatDate(booking.bookingDate, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 shrink-0">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">
                                                <span className="text-gray-400 font-medium mr-1">Time:</span>
                                                {formatTime12Hour(booking.slotTime)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 shrink-0">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">
                                                <span className="text-gray-400 font-medium mr-1">Guests:</span>
                                                {booking.guests} People
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </section>

                        {/* Pre-ordered Items Card */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">Pre-ordered Items</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {booking.preOrderItems.length > 0 ? (
                                        <div className="space-y-6">
                                            {booking.preOrderItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-md font-bold text-gray-800 mb-1">{item.name}</p>
                                                        <p className="text-xs text-gray-400 font-medium tracking-wide">Qty: {item.qty}</p>
                                                    </div>
                                                    <p className="text-md font-bold text-gray-700">₹{(item.priceAtBooking * item.qty).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center">
                                            <p className="text-sm text-gray-400 font-medium italic">No items pre-ordered for this visit.</p>
                                        </div>
                                    )}

                                    <div className="pt-8 space-y-3 border-t border-dashed border-gray-100 mt-10">
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <span className="font-medium">Booking Fee ({booking.guests} x ₹{slotPrice.toFixed(2)})</span>
                                            <span className="font-bold">₹{bookingFee.toFixed(2)}</span>
                                        </div>
                                        {preOrderTotal > 0 && (
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span className="font-medium">Food Subtotal</span>
                                                <span className="font-bold">₹{preOrderTotal.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {tax > 0 && (
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span className="font-medium">Tax (5%)</span>
                                                <span className="font-bold">₹{tax.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {platformFee > 0 && (
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span className="font-medium">Platform Fee (5%)</span>
                                                <span className="font-bold">₹{platformFee.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900 tracking-tight">Total Paid</span>
                                            <span className="text-xl font-bold text-gray-900 tracking-tight">₹{totalPaid.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: 4/12 */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Booking Status Card */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center">
                            <h3 className="text-xs font-bold text-gray-400 tracking-[0.1em] uppercase mb-6">Booking Status</h3>

                            {!isCanceled ? (
                                <>
                                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-green-50 text-green-600 rounded-full font-bold text-sm mb-6 border border-green-100">
                                        <CheckCircle2 size={16} />
                                        Confirmed
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium mb-8 max-w-[200px] leading-relaxed">
                                        Present this QR code at the restaurant for a quick check-in.
                                    </p>

                                    <div className="w-full aspect-square max-w-[240px] bg-red-400/5 rounded-xl p-6 relative flex items-center justify-center border border-dashed border-red-100">
                                        <div className="bg-white p-4 rounded-xl shadow-lg relative z-10 border border-gray-50">
                                            <QRCodeSVG
                                                value={booking.checkInToken || ""}
                                                size={200}
                                                level={"H"}
                                                includeMargin={false}
                                            />
                                        </div>
                                        {isPast && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center p-6 z-20">
                                                <div className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl">Expired</div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="py-10">
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                        <XCircle size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-red-600 mb-2">Cancelled</h4>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-[200px] mx-auto">
                                        This booking has been cancelled and is no longer valid.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Actions Card */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                            <h3 className="text-xs font-bold text-gray-400 tracking-[0.1em] uppercase mb-6">Actions</h3>

                            <div className="space-y-3">
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant?.location?.coordinates[1]},${restaurant?.location?.coordinates[0]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#800000] text-white rounded-xl font-bold text-sm hover:bg-[#600000] transition-colors shadow-sm"
                                >
                                    <Navigation size={18} />
                                    Get Directions
                                </a>

                                {!isCanceled && !isPast && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCanceling}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-white text-red-500 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors shadow-sm mt-3"
                                    >
                                        {isCanceling ? (
                                            <div className="w-5 h-5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <XCircle size={18} />
                                                Cancel Booking
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Sublte Footer ID */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1">
                        Booking Reference
                    </p>
                    <p className="text-[11px] font-medium text-gray-400">
                        #BK{bookingIdShort} • Please quote this ID for support inquiries
                    </p>
                </div>
            </main>
        </div>
    );
};

export default BookingDetails;
