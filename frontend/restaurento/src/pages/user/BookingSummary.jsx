import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import {
    ArrowLeft, Calendar, Clock, Users,
    Trash2, ChevronDown, Star, Copy,
    CheckCircle, AlertCircle, Timer, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/timeUtils';
import { getCategoryFromTimeSlot } from '../../utils/timeCategoryUtils';
import { showToast } from '../../utils/alert';
import userService from '../../services/user.service';
import { TAX_RATE, PLATFORM_FEE_RATE, BOOKING_HOLD_TIME_SECONDS } from '../../constants/constants';

const BookingSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialData = location.state || {};
    const [cart, setCart] = useState(initialData.cart || {});
    const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);

    // Calculate remaining hold time (defaults to 5 minutes)
    const calculateTimeLeft = () => {
        if (!initialData.holdExpirationTime) return BOOKING_HOLD_TIME_SECONDS;
        const remaining = Math.floor((initialData.holdExpirationTime - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useWallet, setUseWallet] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    const socket = useSocket();
    const user = useSelector((state) => state.auth.user);

    const handleBookingRequest = async () => {
        setIsSubmitting(true);
        try {
            const bookingData = {
                restaurantId: restaurant._id,
                bookingDate: date,
                slotTime: Number(initialData.timeSlotMinutes ?? 0),
                guests: Number(partySize),
                useWallet,
                preOrderItems: cartItems.map(item => ({
                    dishId: item._id,
                    name: item.name,
                    qty: Number(item.qty),
                    priceAtBooking: Number(item.price)
                }))
            };

            const response = await userService.createBooking(bookingData);

            if (response.success) {
                // CASE 1: Full Wallet Payment (Booking ID is returned immediately)
                if (response.remainingAmount === 0) {
                    const bookingId = response.booking._id;
                    setIsBookingConfirmed(true);
                    showToast("Booking successful using wallet!", "success");
                    if (socket && user) {
                        socket.emit("confirm_booking", {
                            restaurantId: restaurant._id,
                            date: date,
                            slotMinutes: initialData.timeSlotMinutes || timeSlot,
                            seats: partySize,
                            userId: user._id || user.id,
                            bookingId: bookingId
                        });
                    }
                    navigate('/my-bookings');
                    return;
                }

                // CASE 2: Online/Partial Payment (Order is returned, No Booking ID yet)
                const order = response.order;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: "Restaurento",
                    description: "Table Booking Confirm",
                    order_id: order.id,
                    handler: async function (rzpResponse) {
                        try {
                            const verifyRes = await userService.verifyRazorpayPayment({
                                razorpay_order_id: rzpResponse.razorpay_order_id,
                                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                                razorpay_signature: rzpResponse.razorpay_signature
                            });

                            if (verifyRes.success) {
                                const finalBookingId = verifyRes.bookingId;
                                setIsBookingConfirmed(true);
                                showToast("Payment Successful!", "success");

                                if (socket && user) {
                                    socket.emit("confirm_booking", {
                                        restaurantId: restaurant._id,
                                        date: date,
                                        slotMinutes: initialData.timeSlotMinutes || timeSlot,
                                        seats: partySize,
                                        userId: user._id || user.id,
                                        bookingId: finalBookingId
                                    });
                                }
                                navigate('/my-bookings');
                            }
                        } catch (err) {
                            showToast("Payment verification failed", "error");
                        }
                    },
                    theme: { color: "#ff5e00" }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (rzpResponse) {
                    showToast("Payment Failed or Cancelled", "error");
                });
                rzp.open();
            }
        } catch (error) {
            console.error("Booking error:", error);
            const errorMsg = error.response?.data?.errors
                ? error.response.data.errors.map(err => `${err.field}: ${err.message}`).join(", ")
                : error.response?.data?.message || "Failed to submit booking request.";
            showToast(errorMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!location.state) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f8f8]">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-sm">
                    <div className="w-16 h-16 bg-orange-50 text-[#ff5e00] rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Booking Found</h2>
                    <p className="text-gray-500 text-sm mb-6">It looks like you haven't started a booking yet.</p>
                    <Link to="/" className="inline-block w-full py-3 bg-[#ff5e00] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-[#e05200] transition-all">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const { restaurant, partySize, date, timeSlot } = initialData;
    const mealType = getCategoryFromTimeSlot(timeSlot);

    const cartItems = Object.values(cart);
    const foodTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const seatPrice = (restaurant.slotPrice || 0) * partySize;

    // Calculate final pricing to match the backend
    const subtotal = foodTotal + seatPrice;
    const tax = foodTotal * TAX_RATE;
    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const totalAmount = subtotal + tax + platformFee;

    const amountSaved = 4.00;

    const walletAmountToUse = useWallet ? Math.min(walletBalance, totalAmount) : 0;
    const finalPayable = totalAmount - walletAmountToUse;

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await userService.getWalletBalance();
                setWalletBalance(response.walletBalance || 0);
            } catch (error) {
                console.error("Failed to fetch wallet:", error);
            }
        };
        fetchWallet();
    }, []);

    useEffect(() => {
        if (!restaurant) return;

        const timer = setInterval(() => {
            setTimeLeft(() => {
                const currentRemaining = calculateTimeLeft();
                if (currentRemaining <= 0) {
                    clearInterval(timer);
                    showToast("Your reservation hold has expired. Please try booking again.", "error");
                    navigate(`/restaurants/${restaurant._id}`);
                    return 0;
                }
                return currentRemaining;
            });
        }, 1000);

        return () => {
            clearInterval(timer);

            // Release hold only on actual navigation (skips React StrictMode double mounts)
            const isAuthenticUnmount = window.location.pathname !== '/booking-summary';

            if (!isBookingConfirmed && socket && user && isAuthenticUnmount) {
                socket.emit("release_hold", {
                    restaurantId: restaurant._id,
                    date: date,
                    slotMinutes: initialData.timeSlotMinutes || timeSlot,
                    seats: partySize,
                    userId: user._id || user.id
                });
            }
        };
    }, [restaurant, navigate, isBookingConfirmed, socket, user, date, timeSlot, partySize, initialData.timeSlotMinutes]);

    const handleRemoveItem = (itemId) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[itemId];
            return newCart;
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f8f8] pb-24 font-sans">
            {/* Simple Header */}
            <header className="sticky top-0 z-50 bg-[#f8f8f8]/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">Booking Summary</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2">

                        {/* Header Section */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Booking Summary
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="font-bold text-gray-900">{restaurant.restaurantName}</span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span className="text-gray-500">{restaurant.tags?.join(", ") || "General Cuisine"}</span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <div className="flex items-center gap-1.5">
                                    <Star size={16} className="fill-[#ff9500] text-[#ff9500]" />
                                    <span className="font-bold text-gray-900">{restaurant.ratingStats?.average || "4.5"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Reservation Details */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Reservation Details</h3>
                        <div className="bg-gray-50 p-6 rounded-2xl relative overflow-hidden mb-8">
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                                            <Calendar size={20} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{timeSlot} ({mealType} Slot)</p>
                                        </div>
                                    </div>
                                    <div className="bg-green-100/50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 border border-green-200">
                                        Few seats left
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                                            <Users size={20} className="text-gray-400" />
                                        </div>
                                        <div className="flex items-center">
                                            <p className="font-bold text-gray-900">{partySize} Guests</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pre-ordered Food Items */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Pre-ordered Items</h3>
                        <div className="bg-gray-50 p-6 rounded-2xl relative overflow-hidden mb-8">
                            <div className="relative z-10">

                                {/* Stock Warning */}
                                {cartItems.some(i => i.isUnavailable) && (
                                    <div className="bg-[#fff8e6] border border-[#ffebcc] rounded-2xl p-4 flex gap-3 mb-6">
                                        <AlertCircle size={20} className="text-[#ff9500] shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-[#b36b00]">Some items are unavailable</p>
                                            <p className="text-xs text-[#b36b00]/80 mt-0.5">Please remove unavailable items to proceed.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="divide-y divide-gray-50">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="py-5 flex justify-between items-start group">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    {item.isUnavailable && (
                                                        <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Unavailable</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 font-semibold">
                                                    Qty: {item.qty} @ ₹{item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className={`font-black text-sm ${item.isUnavailable ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    ₹{(item.price * item.qty).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Breakdown */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Breakdown</h3>
                        <div className="bg-gray-50 p-6 rounded-2xl relative overflow-hidden mb-8">
                            <div className="relative z-10">

                                <div className="space-y-2 mb-6 pt-2">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Booking Fee ({partySize} x ₹{restaurant.slotPrice || 0})</span>
                                        <span>₹{seatPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Food Total</span>
                                        <span>₹{foodTotal.toFixed(2)}</span>
                                    </div>
                                    {tax > 0 && (
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                                            <span>₹{tax.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Platform Fee ({(PLATFORM_FEE_RATE * 100).toFixed(0)}%)</span>
                                        <span>₹{platformFee.toFixed(2)}</span>
                                    </div>

                                    <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                                        <p className="font-black text-gray-900">Final Amount</p>
                                        <p className="text-xl font-black text-gray-900">₹{totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Restaurant Policies */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Policies</h3>
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                            <button
                                onClick={() => setIsPoliciesOpen(!isPoliciesOpen)}
                                className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-100/50 transition-colors"
                            >
                                <h3 className="font-bold text-gray-900 text-sm">View Policies</h3>
                                <motion.div animate={{ rotate: isPoliciesOpen ? 180 : 0 }}>
                                    <ChevronDown size={20} className="text-gray-400" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isPoliciesOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-6 pb-6 overflow-hidden"
                                    >
                                        <div className="text-sm text-gray-500 leading-relaxed space-y-2">
                                            <p>• Cancellation within 30 minutes of booking is free.</p>
                                            <p>• Please arrive at least 5 minutes before your slot time.</p>
                                            <p>• For parties larger than 8, please contact the restaurant directly.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column: Sticky Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-0">
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-gray-50">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-black text-gray-900 text-lg">Summary</h3>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-orange-50 text-[#ff5e00]'}`}>
                                            <Timer size={14} />
                                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                        </div>
                                    </div>

                                    {/* Coupons Section */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coupons that can be applied</p>

                                        <div className="space-y-3">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="group relative flex bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-100 transition-colors">
                                                    <div className="p-4 flex-1">
                                                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[8px] font-black uppercase mb-1">
                                                            <CheckCircle size={8} /> BEST VALUE
                                                        </div>
                                                        <p className="text-lg font-black text-gray-900 leading-none">50% OFF</p>
                                                        <p className="text-[8px] text-gray-400 mt-1 leading-tight font-medium max-w-[120px]">
                                                            Get up to ₹15 off on your first order. Minimum order value ₹30.
                                                        </p>
                                                        <div className="flex items-center gap-1 text-[8px] text-gray-400 mt-2 font-bold">
                                                            <Clock size={10} /> Expires in 2 days
                                                        </div>
                                                        <div className="mt-2 flex items-center bg-gray-50 rounded-lg p-1 pr-2 max-w-[140px] border border-gray-100 group-hover:bg-white transition-colors">
                                                            <span className="flex-1 text-[10px] font-black text-gray-700 px-2 tracking-wider">WELCOME50</span>
                                                            {i === 1 ? <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div> : <Copy size={12} className="text-gray-300" />}
                                                        </div>
                                                    </div>
                                                    <div className="w-[100px] shrink-0 bg-gray-200">
                                                        <img
                                                            src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=200&auto=format&fit=crop"
                                                            className="w-full h-full object-cover grayscale-[0.2]"
                                                            alt="Coupon"
                                                        />
                                                        <div className="absolute top-3 right-3 w-5 h-5 bg-white/20 backdrop-blur-md rounded-full border border-white/40 flex items-center justify-center">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${i === 1 ? 'bg-white' : 'bg-transparent'}`}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Final Recap Info */}
                                    <div className="mt-8 pt-8 border-t border-dashed border-gray-100 space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                                <span>Amount saved (Using coupons)</span>
                                                <span className="text-green-600 font-black">₹{amountSaved.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-between items-end border-t border-gray-100">
                                            <p className="font-black text-gray-900 text-sm">Total Payable</p>
                                            <p className="text-xl font-black text-gray-900">₹{totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Wallet Section */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-[#ff5e00]">
                                                    <Wallet size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">Wallet Balance</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">Available: ₹{walletBalance.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setUseWallet(!useWallet)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useWallet ? 'bg-[#ff5e00]' : 'bg-gray-200'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useWallet ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {useWallet && walletAmountToUse > 0 && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mt-4 pt-4 border-t border-dashed border-gray-200"
                                                >
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500 font-medium">Wallet Applied</span>
                                                        <span className="text-[#ff5e00] font-black">-₹{walletAmountToUse.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm mt-2">
                                                        <span className="text-gray-900 font-bold">Payable Amount</span>
                                                        <span className="text-gray-900 font-black">₹{finalPayable.toFixed(2)}</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <button
                                        onClick={handleBookingRequest}
                                        disabled={isSubmitting || cartItems.some(i => i.isUnavailable)}
                                        className={`w-full py-4 font-black rounded-2xl shadow-xl transition-all transform active:scale-[0.98] ${isSubmitting || cartItems.some(i => i.isUnavailable)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                            : 'bg-[#ff5e00] text-white shadow-orange-500/20 hover:bg-[#e05200]'
                                            }`}>
                                        {isSubmitting ? 'Processing...' : finalPayable === 0 ? 'Book with Wallet' : 'Pay Now'}
                                    </button>
                                    <p className="text-[9px] text-gray-400 font-bold text-center mt-4 leading-tight">
                                        You will be redirected to the secure payment gateway.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookingSummary;
