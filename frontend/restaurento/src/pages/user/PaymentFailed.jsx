import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RefreshCw, Timer, ArrowLeft, AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react';
import { showAlert, showToast } from '../../utils/alert';
import userService from '../../services/user.service';

const RETRY_WINDOW_SECONDS = 120;

const PaymentFailed = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [timeLeft, setTimeLeft] = useState(RETRY_WINDOW_SECONDS);
    const [isRetrying, setIsRetrying] = useState(false);
    const [hasExpired, setHasExpired] = useState(false);
    const [retryInfo, setRetryInfo] = useState(null);

    useEffect(() => {
        if (!bookingId) return;
        userService.setRetryHoldWindow(bookingId).then(res => {
            if (res.success) {
                if (res.maxRetries !== undefined) {
                    setRetryInfo({ count: res.paymentRetryCount, max: res.maxRetries });
                }
                if (res.remainingHoldSeconds !== undefined) {
                    setTimeLeft(res.remainingHoldSeconds);
                }
            }
        }).catch(err => {
            console.error("Failed to set retry window:", err);
            if (err.response?.status === 400) {
                setHasExpired(true);
            }
        });
    }, [bookingId]);

    useEffect(() => {
        if (hasExpired) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setHasExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [hasExpired]);

    useEffect(() => {
        if (hasExpired) {
            showToast("Payment window expired. Redirecting to your bookings...", "error");
            const timeout = setTimeout(() => {
                navigate('/my-bookings', { replace: true, state: { activeTab: 'pending' } });
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [hasExpired, navigate]);

    const handleRetryPayment = useCallback(async () => {
        if (isRetrying || hasExpired) return;
        setIsRetrying(true);

        try {
            await userService.checkBookingAvailability(bookingId);

            const retryRes = await userService.retryBookingPayment(bookingId);
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
                    ondismiss: () => {
                        setIsRetrying(false);
                        showToast("Payment cancelled. You can try again.", "info");
                    }
                },
                handler: async function (rzpResponse) {
                    try {
                        const verifyRes = await userService.verifyRazorpayPayment({
                            razorpay_order_id: rzpResponse.razorpay_order_id,
                            razorpay_payment_id: rzpResponse.razorpay_payment_id,
                            razorpay_signature: rzpResponse.razorpay_signature
                        });
                        if (verifyRes.success) {
                            showAlert("Payment Successful!", "Your booking has been confirmed! Enjoy your meal.", "success", "Great!").then(() => {
                                navigate(`/my-bookings/${verifyRes.bookingId || bookingId}`, { replace: true });
                            });
                        } else {
                            setIsRetrying(false);
                            showAlert("Action Required", verifyRes.message || "Something went wrong.", "warning", "OK");
                        }
                    } catch (err) {
                        setIsRetrying(false);
                        showAlert("Verification Error", err.response?.data?.message || "Verification failed.", "error", "OK");
                    }
                },
                theme: { color: "#ff5e00" },
                retry: { enabled: false }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                window.location.reload();
            });
            rzp.open();
        } catch (error) {
            console.error("Retry error:", error);
            setIsRetrying(false);
            const msg = error.response?.data?.message || "Unable to process payment. Please try again.";
            showAlert("Cannot Proceed", msg, "error", "OK").then(() => {
                if (error.response?.status === 429 && error.response?.data?.restaurantId) {
                    navigate(`/restaurants/${error.response.data.restaurantId}`, { replace: true });
                }
            });
        }
    }, [isRetrying, hasExpired, bookingId, navigate]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const attemptsLeft = retryInfo ? retryInfo.max - retryInfo.count : null;
    const progressPercent = (timeLeft / RETRY_WINDOW_SECONDS) * 100;

    const timerColor = hasExpired ? 'text-gray-400'
        : timeLeft < 30 ? 'text-red-500'
        : timeLeft < 60 ? 'text-amber-500'
        : 'text-gray-900';

    const progressColor = hasExpired ? 'bg-gray-200'
        : timeLeft < 30 ? 'bg-red-500'
        : timeLeft < 60 ? 'bg-amber-400'
        : 'bg-[#ff5e00]';

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20">
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 px-2">
                    <Link to="/" className="hover:text-[#ff5e00] transition-colors font-medium">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/my-bookings" className="hover:text-[#ff5e00] transition-colors font-medium">My Bookings</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-bold">Payment Failed</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ── Left: Single unified card ── */}
                    <div className="lg:col-span-8">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                            {/* Card Header */}
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-base font-semibold text-gray-800">Payment Status</h2>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                    Failed
                                </span>
                            </div>

                            <div className="p-6 space-y-8">

                                {/* Status Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 border border-red-100">
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Your payment could not be processed</h3>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                            Don't worry — your seats are still being held. Complete your payment before the timer runs out.
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-dashed border-gray-100" />

                                {/* Timer Section */}
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Seat Hold Timer</p>
                                    <div className="flex items-end gap-4 mb-4">
                                        <p className={`text-5xl font-bold tabular-nums tracking-tight leading-none ${timerColor} ${timeLeft < 30 && !hasExpired ? 'animate-pulse' : ''}`}>
                                            {minutes}:{seconds.toString().padStart(2, '0')}
                                        </p>
                                        <div className="mb-1 flex items-center gap-1.5 text-gray-400">
                                            <Timer size={14} />
                                            <span className="text-xs font-semibold">
                                                {hasExpired ? "Expired" : timeLeft < 60 ? "Hurry up!" : "remaining"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${progressColor}`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-gray-400 font-medium">
                                        {hasExpired
                                            ? "Time's up! Redirecting to your bookings..."
                                            : "If the timer expires, your booking will automatically move to Pending Payments in My Bookings."
                                        }
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-dashed border-gray-100" />

                                {/* Info note */}
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                        Seats will be released back to the pool once your timer expires. You may still find them in <strong className="text-gray-500">My Bookings → Pending Payments</strong>.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ── Right: Single unified card ── */}
                    <div className="lg:col-span-4">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">

                            <div className="px-6 py-4 border-b border-gray-50">
                                <h2 className="text-base font-semibold text-gray-800">Actions</h2>
                            </div>

                            <div className="p-6 space-y-6">

                                {/* Attempt Dots */}
                                {retryInfo && (
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Retry Attempts</p>
                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: retryInfo.max }).map((_, i) => (
                                                <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
                                                    i < retryInfo.count ? 'bg-red-200' : 'bg-[#ff5e00]'
                                                }`} />
                                            ))}
                                        </div>
                                        {attemptsLeft !== null && (
                                            <p className="text-xs text-gray-500 font-semibold mt-2">
                                                <span className="text-gray-900 font-bold">{attemptsLeft}</span> attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleRetryPayment}
                                        disabled={isRetrying || hasExpired}
                                        className={`w-full flex items-center justify-center gap-2 py-4 font-bold rounded-xl text-sm transition-all active:scale-[0.98] ${
                                            isRetrying || hasExpired
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#ff5e00] text-white shadow-lg shadow-orange-100 hover:bg-[#e05200]'
                                        }`}
                                    >
                                        <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
                                        {isRetrying ? 'Processing...' : 'Try Again'}
                                    </button>

                                    <Link
                                        to="/my-bookings"
                                        state={{ activeTab: 'pending' }}
                                        className="w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
                                    >
                                        <ArrowLeft size={16} />
                                        Go to My Bookings
                                    </Link>
                                </div>

                                {/* Booking ref */}
                                <p className="text-[10px] text-gray-300 font-medium text-center uppercase tracking-[0.15em] pt-2 border-t border-gray-50">
                                    #BK{bookingId?.slice(-8)?.toUpperCase()}
                                </p>
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PaymentFailed;
