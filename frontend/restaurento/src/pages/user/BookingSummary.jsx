import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import {
    ArrowLeft, Calendar, Clock, Users,
    Trash2, ChevronDown, Star, Copy,
    CheckCircle, AlertCircle, Timer, Wallet, X,
    Ticket, Tag, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/timeUtils';
import { getCategoryFromTimeSlot, getCategoryFromMinutes } from '../../utils/timeCategoryUtils';
import { showToast, showConfirm, showAlert } from '../../utils/alert';
import userService from '../../services/user.service';
import { TAX_RATE, PLATFORM_FEE_RATE, BOOKING_HOLD_TIME_SECONDS } from '../../constants/constants';

const BookingSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialData = location.state || {};
    const { restaurant, partySize, date, timeSlot, timeSlotMinutes } = initialData;
    const [cart, setCart] = useState(initialData.cart || {});
    const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);

    // Coupon States
    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);

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

    const currentSlotMinutes = Number(initialData.timeSlotMinutes ?? 0);
    const currentSlotCategory = getCategoryFromMinutes(currentSlotMinutes);

    const cartItems = Object.entries(cart).map(([id, item]) => {
        const dbDish = initialData.restaurant?.menuItems?.find(m => m._id?.toString() === id?.toString());

        // Case-insensitive category check
        const itemCategories = (dbDish?.categories || []).map(c => c.toLowerCase());
        const matchCat = (currentSlotCategory || "").toLowerCase();
        const isCategoryMismatch = currentSlotCategory && itemCategories.length > 0 && !itemCategories.includes(matchCat);

        return {
            ...item,
            _id: id,
            isUnavailable: !dbDish || dbDish.isDeleted || !dbDish.isAvailable || isCategoryMismatch,
            isCategoryMismatch,
            allowedCategories: dbDish?.categories || []
        };
    });

    const handleBookingRequest = async () => {
        setIsSubmitting(true);
        try {
            const bookingData = {
                restaurantId: initialData.restaurant._id,
                bookingDate: initialData.date,
                slotTime: Number(initialData.timeSlotMinutes ?? 0),
                guests: Number(partySize),
                useWallet,
                appliedCouponId: selectedCoupon ? selectedCoupon._id : null,
                appliedOfferId: qualifyingOffer ? qualifyingOffer._id : null,
                discountAmount: amountSaved,
                preOrderItems: cartItems.map(item => ({
                    dishId: item._id,
                    name: item.name,
                    qty: Number(item.qty),
                    priceAtBooking: Number(item.price)
                }))
            };

            const response = await userService.createBooking(bookingData);

            if (response.success) {
                const bookingId = response.bookingId;

                if (response.remainingAmount === 0) {
                    setIsBookingConfirmed(true);
                    showConfirm("Booking Successful!", "Your table has been reserved using your wallet balance.", "View My Bookings").then(() => {
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
                        navigate(`/my-bookings/${bookingId}`, { replace: true });
                    });
                    return;
                }

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
                                setIsBookingConfirmed(true);
                                showAlert("Payment Successful!", "Your booking is now confirmed. Enjoy!", "success", "Great!").then(() => {
                                    if (socket && user) {
                                        socket.emit("confirm_booking", {
                                            restaurantId: restaurant._id,
                                            date: date,
                                            slotMinutes: timeSlotMinutes,
                                            seats: partySize,
                                            userId: user._id || user.id,
                                            bookingId: bookingId
                                        });
                                    }
                                    navigate(`/my-bookings/${bookingId}`, { replace: true });
                                });
                            }
                        } catch (err) {
                            const errorMsg = err.response?.data?.message || "Payment verification failed";
                            showConfirm("Action Required", errorMsg, "OK").then(() => {
                                navigate(`/my-bookings/${bookingId}`, { replace: true });
                            });
                        }
                    },
                    theme: { color: "#ff5e00" }
                };

                options.modal = {
                    ondismiss: () => {
                        showToast("Payment cancelled", "info");
                        navigate(`/my-bookings/${bookingId}`, { replace: true });
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    setIsSubmitting(false);
                    showAlert("Payment Failed", "Something went wrong with the transaction. Your seats are still held - you can retry from your bookings.", "error", "Retry").then(() => {
                        navigate(`/my-bookings/${bookingId}`, { replace: true });
                    });
                });
                rzp.open();
            }
        } catch (error) {
            console.error("Booking error:", error);
            const errorMsg = error.response?.data?.errors
                ? error.response.data.errors.map(err => `${err.field}: ${err.message}`).join(", ")
                : error.response?.data?.message || "Failed to submit booking request.";
            showToast(errorMsg, "error");
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

    const foodTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const seatPrice = (restaurant?.slotPrice || 0) * (partySize || 1);

    // Calculate final pricing to match the backend
    const subtotal = foodTotal + seatPrice;
    const tax = foodTotal * TAX_RATE;
    const platformFee = subtotal * PLATFORM_FEE_RATE;

    // Calculate discounts
    let amountSaved = 0;
    if (selectedCoupon) {
        const rawDiscount = subtotal * (selectedCoupon.discountValue / 100);
        amountSaved = selectedCoupon.maxDiscountCap
            ? Math.min(rawDiscount, selectedCoupon.maxDiscountCap)
            : rawDiscount;
    }

    // Live calculate best available offer (Auto-applied)
    const availableOffers = restaurant?.offers || [];
    const qualifyingOfferLookup = availableOffers
        .filter(offer => subtotal >= (offer.minOrderValue || 0))
        .sort((a, b) => b.discountValue - a.discountValue)[0];

    const offerDiscount = qualifyingOfferLookup ? qualifyingOfferLookup.discountValue : 0;
    const qualifyingOffer = qualifyingOfferLookup; // For consistency with other parts of the code

    const totalAmount = subtotal + tax + platformFee - amountSaved - offerDiscount;
    const walletAmountToUse = useWallet ? Math.min(walletBalance, totalAmount) : 0;
    const finalPayable = Math.max(0, totalAmount - walletAmountToUse);

    useEffect(() => {
        const loadCoupons = async () => {
            try {
                const response = await userService.getAvailableCoupons();
                if (response?.success) {
                    setCoupons(response.coupons || []);
                }
            } catch (error) {
                console.error("Failed to load coupons", error);
            }
        };
        loadCoupons();
    }, []);

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
                    navigate(`/restaurants/${restaurant._id}`, { replace: true });
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
                    slotMinutes: timeSlotMinutes,
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
                                {restaurant.ratingStats?.count > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <Star size={16} className="fill-[#ff9500] text-[#ff9500]" />
                                        <span className="font-bold text-gray-900">{restaurant.ratingStats.average}</span>
                                    </div>
                                )}
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
                                            <p className="text-sm text-gray-500 mt-0.5">{timeSlot} ({currentSlotCategory} Slot)</p>
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

                                {/* Stock & Category Warning */}
                                {cartItems.some(i => i.isUnavailable) && (
                                    <div className="bg-[#fff8e6] border border-[#ffebcc] rounded-2xl p-4 flex gap-3 mb-6">
                                        <AlertCircle size={20} className="text-[#ff9500] shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-[#b36b00]">Issue with some items</p>
                                            <p className="text-xs text-[#b36b00]/80 mt-0.5">Please remove items that are unavailable or don't match your booking time (<b>{currentSlotCategory}</b>).</p>
                                        </div>
                                    </div>
                                )}

                                <div className="divide-y divide-gray-50">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="py-5 flex justify-between items-start group">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    {item.isCategoryMismatch ? (
                                                        <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                                                            <Clock size={10} /> {item.allowedCategories.join(' & ')} Only
                                                        </span>
                                                    ) : item.isUnavailable && (
                                                        <span className="text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-red-100">Unavailable</span>
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
                                    {offerDiscount > 0 && (
                                        <div className="flex justify-between text-xs text-green-600 font-bold">
                                            <span>Restaurant Offer</span>
                                            <span>-₹{offerDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
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
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Coupons</p>
                                            {coupons.length > 2 && (
                                                <button onClick={() => setIsCouponsModalOpen(true)} className="text-[10px] font-bold text-[#ff5e00] hover:underline">
                                                    View All
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {coupons.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-gray-400 font-medium">No active coupons right now</div>
                                            ) : (
                                                [...coupons].sort((a, b) => {
                                                    if (selectedCoupon?._id === a._id) return -1;
                                                    if (selectedCoupon?._id === b._id) return 1;
                                                    return 0;
                                                }).slice(0, 2).map((coupon) => {
                                                    const isEligible = subtotal >= (coupon.minOrderValue || 0);
                                                    const isSelected = selectedCoupon?._id === coupon._id;

                                                    return (
                                                        <div
                                                            key={coupon._id}
                                                            onClick={isEligible ? () => setSelectedCoupon(isSelected ? null : coupon) : undefined}
                                                            className={`group relative flex flex-col border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 ${!isEligible ? 'bg-gray-50 border-gray-200 opacity-60 grayscale' : isSelected ? 'bg-[#fff5eb] border-[#ff5e00] shadow-md shadow-orange-100/50' : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer'}`}
                                                        >
                                                            {/* Ticket Cutout Semi-circles overlays */}
                                                            <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-r-2 border-dashed ${isSelected ? 'border-[#ff5e00] bg-white' : 'border-gray-200 bg-white'}`}></div>
                                                            <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-l-2 border-dashed ${isSelected ? 'border-[#ff5e00] bg-white' : 'border-gray-200 bg-white'}`}></div>

                                                            <div className="p-4 pl-5">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#ff5e00] text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-[#ff5e00] group-hover:text-white transition-colors'}`}>
                                                                            <Ticket size={14} />
                                                                        </div>
                                                                        {isSelected && (
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase tracking-wider">
                                                                                <CheckCircle size={8} /> Applied
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#ff5e00] bg-[#ff5e00]' : 'border-gray-300'}`}>
                                                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                                    </div>
                                                                </div>

                                                                <h4 className={`text-xl font-black tracking-tight ${isSelected ? 'text-[#ff5e00]' : 'text-gray-900'}`}>
                                                                    {coupon.discountValue}% OFF
                                                                </h4>
                                                                <p className="text-[10px] text-gray-500 mt-1 leading-snug font-medium pr-2">
                                                                    {coupon.description || `Save ${coupon.discountValue}% up to ₹${coupon.maxDiscountCap} on your entire bill.`}
                                                                </p>

                                                                {!isEligible && (
                                                                    <div className="mt-3 inline-block px-2 py-1 bg-red-50 rounded text-[9px] text-red-600 font-bold border border-red-100">
                                                                        Add ₹{(coupon.minOrderValue - subtotal).toFixed(2)} more to unlock!
                                                                    </div>
                                                                )}

                                                                <div className="mt-3 pt-3 border-t border-dashed border-gray-200/60 flex items-center justify-between">
                                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                                        <Tag size={10} /> CODE:
                                                                    </div>
                                                                    <span className={`font-black text-xs tracking-widest ${isSelected ? 'text-[#ff5e00]' : 'text-gray-900'}`}>{coupon.code}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Final Recap Info */}
                                    <div className="mt-8 pt-8 border-t border-dashed border-gray-100 space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                                <span>Amount saved (Using coupons)</span>
                                                <span className="text-green-600 font-black">₹{amountSaved.toFixed(2)}</span>
                                            </div>
                                            {offerDiscount > 0 && (
                                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                                    <span>Restaurant Offer Applied</span>
                                                    <span className="text-green-600 font-black">₹{offerDiscount.toFixed(2)}</span>
                                                </div>
                                            )}
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
                                                disabled={walletBalance <= 0}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useWallet ? 'bg-[#ff5e00]' : 'bg-gray-200'} ${walletBalance <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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

            {/* Coupons View All Modal */}
            <AnimatePresence>
                {isCouponsModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCouponsModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">All Coupons</h2>
                                    <p className="text-xs font-bold text-gray-400 mt-1">Available to apply</p>
                                </div>
                                <button onClick={() => setIsCouponsModalOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-4">
                                {coupons.map((coupon) => {
                                    const isEligible = subtotal >= (coupon.minOrderValue || 0);
                                    const isSelected = selectedCoupon?._id === coupon._id;

                                    return (
                                        <div
                                            key={coupon._id}
                                            onClick={isEligible ? () => { setSelectedCoupon(isSelected ? null : coupon); setIsCouponsModalOpen(false); } : undefined}
                                            className={`group relative flex flex-col border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 ${!isEligible ? 'bg-gray-50 border-gray-200 opacity-60 grayscale' : isSelected ? 'bg-[#fff5eb] border-[#ff5e00] shadow-md shadow-orange-100/50' : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer'}`}
                                        >
                                            {/* Ticket Cutout Semi-circles overlays */}
                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-r-2 border-dashed border-gray-200"></div>
                                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-l-2 border-dashed border-gray-200"></div>

                                            <div className="p-5 pl-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#ff5e00] text-white' : 'bg-orange-50 text-[#ff5e00] group-hover:bg-[#ff5e00] group-hover:text-white transition-colors'}`}>
                                                            <Percent size={18} />
                                                        </div>
                                                        {isSelected && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                                <CheckCircle size={10} /> Applied
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#ff5e00] bg-[#ff5e00]' : 'border-gray-300'}`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                </div>

                                                <h4 className={`text-2xl font-black tracking-tight ${isSelected ? 'text-[#ff5e00]' : 'text-gray-900'}`}>
                                                    {coupon.discountValue}% OFF
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                                                    {coupon.description || `Save ${coupon.discountValue}% up to ₹${coupon.maxDiscountCap} on your entire bill.`}
                                                </p>

                                                {!isEligible && (
                                                    <div className="mt-3 inline-block px-2.5 py-1 bg-red-50 rounded-md text-[10px] text-red-600 font-bold border border-red-100">
                                                        Add ₹{(coupon.minOrderValue - subtotal).toFixed(2)} more to cart to unlock this deal!
                                                    </div>
                                                )}

                                                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                                        <Tag size={12} /> PROMO CODE:
                                                    </div>
                                                    <span className={`font-black tracking-widest ${isSelected ? 'text-[#ff5e00]' : 'text-gray-900'}`}>{coupon.code}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookingSummary;
