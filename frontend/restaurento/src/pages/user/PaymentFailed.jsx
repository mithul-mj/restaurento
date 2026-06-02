import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RefreshCw, Timer, ArrowLeft, AlertTriangle, AlertCircle } from 'lucide-react';
import { showAlert, showToast } from '../../utils/alert';
import userService from '../../services/user.service';

const RETRY_WINDOW_SECONDS = 120; // 2 minutes to retry

const PaymentFailed = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [timeLeft, setTimeLeft] = useState(RETRY_WINDOW_SECONDS);
    const [isRetrying, setIsRetrying] = useState(false);
    const [hasExpired, setHasExpired] = useState(false);
    const [retryInfo, setRetryInfo] = useState(null);

    // Truncate the backend hold to exactly 2 minutes as soon as this page loads
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
            // If the backend says the hold is already gone, expire the session immediately
            if (err.response?.status === 400) {
                setHasExpired(true);
            }
        });
    }, [bookingId]);

    // Countdown timer — redirect to Failed Payments tab in My Bookings when it expires
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

    // When timer expires, redirect to failed payments tab
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
            // 1. Check availability
            await userService.checkBookingAvailability(bookingId);

            // 2. Extend hold and get new order
            const retryRes = await userService.retryBookingPayment(bookingId);
            if (!retryRes.success || !retryRes.order) {
                throw new Error(retryRes.message || "Failed to refresh payment order.");
            }

            // 3. Open Razorpay checkout
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
                        const errorMessage = err.response?.data?.message || "Verification failed.";
                        showAlert("Verification Error", errorMessage, "error", "OK");
                    }
                },
                theme: { color: "#ff5e00" },
                retry: { enabled: false }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                // A hard reload completely destroys the Razorpay iframe and resets the SDK state
                window.location.reload();
            });
            rzp.open();
        } catch (error) {
            console.error("Retry error:", error);
            setIsRetrying(false);
            const msg = error.response?.data?.message || "Unable to process payment. Please try again.";
            
            showAlert("Cannot Proceed", msg, "error", "OK").then(() => {
                // Redirect to restaurant details if max retries reached (429 limit hit)
                if (error.response?.status === 429 && error.response?.data?.restaurantId) {
                    navigate(`/restaurants/${error.response.data.restaurantId}`, { replace: true });
                }
            });
        }
    }, [isRetrying, hasExpired, bookingId, navigate]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center px-4 py-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-sm w-full">

                {/* Error Icon */}
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <AlertCircle size={32} />
                </div>

                {/* Title & Description */}
                <h2 className="text-base font-semibold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[260px] mx-auto">
                    Your payment could not be processed. Don't worry — your seats are still being held for you.
                </p>

                {/* Timer Badge */}
                <div className="mt-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border ${
                        timeLeft < 30
                            ? 'bg-red-50 text-red-600 border-red-100 animate-pulse'
                            : timeLeft < 60
                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                : 'bg-orange-50 text-[#ff5e00] border-orange-100'
                    }`}>
                        <Timer size={14} />
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium mt-2">
                        {hasExpired
                            ? "Time's up! Redirecting to your bookings..."
                            : "Complete the payment before time runs out."
                        }
                    </p>
                </div>

                {/* Retry Attempts Left */}
                {retryInfo && retryInfo.count < retryInfo.max && (
                    <div className="mt-4 inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5e00]"></span>
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                            Attempts Left: <strong className="text-gray-900 ml-1">{retryInfo.max - retryInfo.count}</strong>
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleRetryPayment}
                        disabled={isRetrying || hasExpired}
                        className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98] ${
                            isRetrying || hasExpired
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                : 'bg-[#ff5e00] text-white shadow-orange-100 hover:bg-[#e05200]'
                        }`}
                    >
                        {isRetrying ? 'Processing...' : 'Try Again'}
                    </button>

                    <Link
                        to="/my-bookings"
                        state={{ activeTab: 'pending' }}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Go to My Bookings
                    </Link>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-6 flex gap-2.5 items-start max-w-sm px-2">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    If the timer runs out, your booking will move to <strong className="text-gray-500">"Failed Payments"</strong> in My Bookings where you can still retry if seats are available.
                </p>
            </div>

            {/* Booking Reference */}
            <p className="text-[10px] text-gray-300 font-medium mt-4 uppercase tracking-[0.2em]">
                Booking #{bookingId?.slice(-8)?.toUpperCase()}
            </p>
        </div>
    );
};

export default PaymentFailed;
