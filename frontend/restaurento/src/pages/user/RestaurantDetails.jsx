import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Star, MapPin, Clock, Phone, Heart, ChevronRight, AlertTriangle, ChevronDown, User, Minus, Plus, Calendar, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import userService from "../../services/user.service";
import LocationViewer from "../../components/shared/LocationViewer";
import ImageGallery from "../../components/shared/ImageGallery";
import RestaurantMenu from "./RestaurantMenu";
import RestaurantReviews from "./RestaurantReviews";
import { TAX_RATE, PLATFORM_FEE_RATE } from "../../utils/constants";
import { formatTime12Hour, formatDate } from "../../utils/timeUtils";
import { getCategoryFromTimeSlot } from "../../utils/timeCategoryUtils";
import { showConfirm, showToast } from "../../utils/alert";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("about");
    const [partySize, setPartySize] = useState(2);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [cart, setCart] = useState(location.state?.prefilledCart || {});
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [liveSlotAvailability, setLiveSlotAvailability] = useState({});
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        if (location.state?.prefilledCart) {
            const newState = { ...location.state };
            delete newState.prefilledCart;
            navigate(location.pathname + location.search, {
                replace: true,
                state: Object.keys(newState).length > 0 ? newState : null
            });
        }
    }, [location.pathname, location.search, location.state, navigate]);


    const user = useSelector((state) => state.auth.user);
    const socket = useSocket();

    const dateOptions = Array.from({ length: 5 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const value = date.toISOString().split('T')[0];
        let label;
        if (i === 0) label = "Today";
        else if (i === 1) label = "Tomorrow";
        else {
            label = formatDate(date, { weekday: 'short', month: 'short', day: 'numeric', year: undefined });
        }
        return { value, label };
    });

    // Track party size for animation direction
    const prevPartySize = useRef(partySize);
    useEffect(() => {
        prevPartySize.current = partySize;
    }, [partySize]);
    const direction = partySize > prevPartySize.current ? 1 : -1;

    const handleSaveWishlist = async () => {
        const cartItems = Object.values(cart);

        if (cartItems.length === 0) {
            showToast('Add some dishes first!', 'error');
            return;
        }

        const confirm = await showConfirm(
            "Save to Wishlist?",
            "Do you want to save these items to your wishlist for later?",
            "Yes, save it!"
        );

        if (!confirm.isConfirmed) return;

        try {
            const mealType = getCategoryFromTimeSlot(selectedTimeSlot) || "Lunch";

            const payload = {
                restaurantId: id,
                items: cartItems.map((item) => ({
                    dishId: item._id,
                    qty: item.qty
                })),
                mealType
            };

            const response = await userService.addToWishlist(payload);
            showToast(response.message || 'Saved to wishlist!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Something went wrong!', 'error');
        }
    }



    const handleUpdateCart = (item, change) => {
        setCart(prev => {
            const currentItem = prev[item._id];
            const currentQty = currentItem?.qty || 0;
            const newQty = Math.max(0, currentQty + change);

            if (newQty === 0) {
                const { [item._id]: _, ...rest } = prev;
                return rest;
            }

            return {
                ...prev,
                [item._id]: { ...item, qty: newQty }
            };
        });
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ["restaurant", id],
        queryFn: () => userService.getRestaurantDetails(id),
    });

    const restaurant = data?.restaurant;
    const pricePerPerson = restaurant?.slotPrice || 0;
    const bookingFee = pricePerPerson * partySize;

    const cartItems = Object.values(cart);
    const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const subtotal = bookingFee + itemTotal;
    const tax = itemTotal * TAX_RATE;
    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const finalTotal = subtotal + tax + platformFee;

    const bookingDateRef = useRef(null);

    useEffect(() => {
        bookingDateRef.current = {
            restaurant, partySize, date: selectedDate, timeSlot: selectedTimeSlot, timeSlotMinutes: availableMinutes[availableLabels.indexOf(selectedTimeSlot)],
            cart, bookingFee, itemTotal, subtotal, tax, platformFee, total: finalTotal,
            holdExpirationTime: Date.now() + 5 * 60 * 1000
        };
    });

    const getSlotStatus = () => {
        if (!restaurant?.openingHours?.days) return { status: 'no_schedule', slots: [] };

        const date = new Date(selectedDate);
        const jsDay = date.getDay();
        const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

        const daySchedule = restaurant.openingHours.days[dayIndex];

        if (!daySchedule || daySchedule.isClosed) {
            return { status: 'closed', slots: [] };
        }

        let slots = [];
        if (daySchedule.generatedSlots && daySchedule.generatedSlots.length > 0) {
            slots = daySchedule.generatedSlots.map(s => s.startTime);
        }

        // Hide past time slots for today
        const today = new Date();
        const isToday = today.toISOString().split('T')[0] === selectedDate;
        if (isToday) {
            const currentMinutes = today.getHours() * 60 + today.getMinutes();
            // Filter slots based on the shared buffer constant
            slots = slots.filter(start => start > currentMinutes + BOOKING_BUFFER_MINUTES);
        }

        if (slots.length === 0) {
            return { status: 'no_slots', slots: [] };
        }

        return { status: 'open', slots };
    };

    const { status: slotStatus, slots: availableMinutes } = getSlotStatus();
    const availableLabels = availableMinutes.map(m => formatTime12Hour(m));
    const isSlotInvalid = selectedTimeSlot && !availableLabels.includes(selectedTimeSlot);

    useEffect(() => {
        if (!socket) return;

        if (id && selectedDate) {
            socket.emit("view_date_slots", { restaurantId: id, date: selectedDate });
            // Subscribe to date channel first
        }

        const handleSlotUpdate = ({ slotMinutes, available }) => {
            setLiveSlotAvailability(prev => ({
                ...prev,
                [slotMinutes]: available
            }));
        };

        const handleInitialAvailability = (availabilityMap) => {
            setLiveSlotAvailability(prev => ({ ...prev, ...availabilityMap }));
        };

        const handleReserveSuccess = () => {
            setIsBooking(false);
            navigate('/booking-summary', { state: bookingDateRef.current });
        };

        const handleReserveFail = ({ message }) => {
            setIsBooking(false);
            showToast(message, 'error');
        };
        const handleReserveError = ({ message }) => {
            setIsBooking(false);
            showToast(message, 'error');
        };

        socket.on("initial_availability", handleInitialAvailability);
        socket.on("slot_update", handleSlotUpdate);
        socket.on("reserve_success", handleReserveSuccess);
        socket.on("reserve_fail", handleReserveFail);
        socket.on("reserve_error", handleReserveError);

        return () => {
            socket.off("initial_availability", handleInitialAvailability);
            socket.off("slot_update", handleSlotUpdate);
            socket.off("reserve_success", handleReserveSuccess);
            socket.off("reserve_fail", handleReserveFail);
            socket.off("reserve_error", handleReserveError);
        };
    }, [socket, id, selectedDate, navigate]);

    // Fetch live seat availability
    useEffect(() => {
        if (socket && id && selectedDate && availableMinutes.length > 0) {
            socket.emit("check_availability", { restaurantId: id, date: selectedDate, slots: availableMinutes });
        }
    }, [socket, id, selectedDate, availableMinutes]);



    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fcfcfc]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff5e00]"></div>
            </div>
        );
    }

    if (isError || !restaurant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfcfc]">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Not Found</h2>
                <Link to="/" className="text-[#ff5e00] hover:underline">Back to Home</Link>
            </div>
        );
    }

    const handleBookNow = () => {
        if (!selectedTimeSlot) {
            showToast('Please select a time slot first!', 'error');
            return;
        }

        if (Object.keys(cart).length === 0) {
            showToast('Please add at least one item to your order!', 'error');
            return;
        }

        if (!socket) {
            showToast('Live booking connection is not established. Please make sure you are logged in.', 'error');
            return;
        }

        if (restaurant) {
            setIsBooking(true);
            const slotIndex = availableLabels.indexOf(selectedTimeSlot);
            const slotMinutes = availableMinutes[slotIndex];

            socket.emit("reserve_seats", {
                restaurantId: id,
                date: selectedDate,
                slotMinutes: slotMinutes,
                seats: partySize,
                userId: user?._id || user?.id
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-20">
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">



                <div className="mb-10">
                    <ImageGallery images={restaurant.images || []} />
                </div>


                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">

                    <Link to="/" className="hover:text-[#ff5e00] transition-colors">Restaurants</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">{restaurant.restaurantName}</span>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {restaurant.restaurantName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                    <Star size={18} className="fill-[#ff9500] text-[#ff9500]" />
                                    <span>{restaurant.ratingStats?.average || "New"}</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span className="underline decoration-gray-300 decoration-1 underline-offset-2">
                                    {restaurant.ratingStats?.count || 0} reviews
                                </span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span>₹{pricePerPerson.toFixed(2)} per person</span>
                            </div>
                        </div>


                        <div className="flex items-center gap-8 border-b border-gray-100 mb-8 overflow-x-auto">
                            {["About", "Menu", "Reviews"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`relative pb-4 text-base font-medium transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase()
                                        ? "text-[#ff5e00]"
                                        : "text-gray-500 hover:text-gray-800"
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab.toLowerCase() && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff5e00] rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>


                        <AnimatePresence mode="wait">
                            {activeTab === "about" && (
                                <motion.div
                                    key="about"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">About {restaurant.restaurantName}</h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {restaurant.description || `Experience the heart of ${restaurant.tags?.includes("Italian") ? "Italy" : "culinary excellence"} right here. 
                                    ${restaurant.restaurantName} offers a culinary journey through authentic flavors, crafted 
                                    with passion from the freshest local ingredients.`}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {restaurant.tags?.map((tag, idx) => (
                                            <span key={idx} className="px-4 py-1.5 bg-orange-50 text-[#ff5e00] rounded-full text-xs font-semibold">
                                                {tag}
                                            </span>
                                        ))}

                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl relative overflow-hidden">
                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="text-gray-400 mt-0.5 shrink-0" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{restaurant.address}</p>
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${restaurant.location?.coordinates?.[1]},${restaurant.location?.coordinates?.[0]}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-gray-400 font-medium hover:text-[#ff5e00] hover:underline transition-colors mt-0.5 inline-block"
                                                    >
                                                        View in Map
                                                    </a>

                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Clock className="text-gray-400 mt-0.5" size={18} />
                                                <div className="space-y-1">
                                                    {restaurant.openingHours?.days?.map((day, index) => {
                                                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];



                                                        return (
                                                            <div key={index} className="flex justify-between text-sm text-gray-900 w-full min-w-[200px] border-b border-gray-100 py-1 last:border-0 border-dashed">
                                                                <span className="font-medium text-gray-500 w-24">{days[index]}:</span>
                                                                <span className="font-semibold">
                                                                    {day.isClosed ? (
                                                                        <span className="text-red-500">Closed</span>
                                                                    ) : (
                                                                        `${formatTime12Hour(day.startTime)} - ${formatTime12Hour(day.endTime)}`
                                                                    )}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}

                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Phone className="text-gray-400 mt-0.5" size={18} />
                                                <p className="text-sm font-semibold text-gray-900">{restaurant.restaurantPhone || "Not Available"}</p>
                                            </div>
                                        </div>


                                        <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-1/2 hidden md:block">
                                            <div className="w-full h-full relative">
                                                <div className="absolute inset-0 z-0">
                                                    <LocationViewer
                                                        lat={restaurant.location?.coordinates?.[1]}
                                                        lng={restaurant.location?.coordinates?.[0]}
                                                    />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pointer-events-none md:via-gray-50/50"></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "menu" && (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <RestaurantMenu
                                        restaurantId={id}
                                        cart={cart}
                                        updateCart={handleUpdateCart}
                                        selectedTimeSlot={selectedTimeSlot}
                                    />
                                </motion.div>
                            )}

                            {activeTab === "reviews" && (
                                <motion.div
                                    key="reviews"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <RestaurantReviews restaurantId={id} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Pre-Order Summary</h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Date</label>
                                    <div className="relative z-20">
                                        <button
                                            onClick={() => setIsDateOpen(!isDateOpen)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 h-[46px] text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00]"
                                        >
                                            <Calendar size={16} className="text-[#ff5e00]" />
                                            <span className="flex-1 text-left text-gray-900 truncate">
                                                {dateOptions.find(d => d.value === selectedDate)?.label || selectedDate}
                                            </span>
                                            <motion.div
                                                animate={{ rotate: isDateOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown size={16} className="text-gray-400" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isDateOpen && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-30"
                                                        onClick={() => setIsDateOpen(false)}
                                                    />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                                        className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-orange-500/10 overflow-hidden z-40 py-1"
                                                    >
                                                        {dateOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                onClick={() => {
                                                                    setSelectedDate(option.value);
                                                                    setIsDateOpen(false);
                                                                }}
                                                                className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between hover:bg-orange-50 transition-colors ${selectedDate === option.value ? 'bg-orange-50 text-[#ff5e00] font-bold' : 'text-gray-600 font-medium'}`}
                                                            >
                                                                <span>{option.label}</span>
                                                                {selectedDate === option.value && <Check size={14} />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Party Size</label>
                                    <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-1 h-[46px]">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setPartySize(Math.max(1, Number(partySize) - 1))}
                                            disabled={partySize <= 1}
                                            className="w-9 h-full flex items-center justify-center bg-white rounded-lg text-gray-500 shadow-sm hover:text-[#ff5e00] disabled:opacity-50 disabled:shadow-none transition-colors"
                                            type="button"
                                        >
                                            <Minus size={16} strokeWidth={2.5} />
                                        </motion.button>
                                        <div className="relative w-24 h-full overflow-hidden [perspective:500px]">
                                            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                                <motion.div
                                                    key={partySize}
                                                    custom={direction}
                                                    initial={(dir) => ({ y: dir * 30, rotateX: dir * -90, opacity: 0 })}
                                                    animate={{ y: 0, rotateX: 0, opacity: 1 }}
                                                    exit={(dir) => ({ y: dir * -30, rotateX: dir * 90, opacity: 0 })}
                                                    transition={{ duration: 0.3, ease: "backOut" }}
                                                    className="absolute inset-0 flex items-center justify-center gap-1 origin-center"
                                                    style={{ backfaceVisibility: "hidden" }}
                                                >
                                                    <span className="text-sm font-bold text-gray-900">{partySize}</span>
                                                    <span className="text-sm text-gray-400 font-normal">
                                                        {partySize === 1 ? 'Guest' : 'Guests'}
                                                    </span>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                        {(() => {
                                            const selectedSlotIndex = availableLabels.indexOf(selectedTimeSlot);
                                            const selectedSlotMinutes = selectedSlotIndex >= 0 ? availableMinutes[selectedSlotIndex] : null;
                                            const liveAvailableSeats = selectedSlotMinutes && liveSlotAvailability[selectedSlotMinutes] !== undefined
                                                ? liveSlotAvailability[selectedSlotMinutes]
                                                : restaurant?.totalSeats || 1;
                                            const maxAllowedPartySize = Math.max(1, Math.min(10, restaurant?.totalSeats || 1, liveAvailableSeats));

                                            return (
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setPartySize(Math.min(maxAllowedPartySize, Number(partySize) + 1))}
                                                    disabled={partySize >= maxAllowedPartySize}
                                                    className="w-9 h-full flex items-center justify-center bg-white rounded-lg text-gray-500 shadow-sm hover:text-[#ff5e00] disabled:opacity-50 disabled:shadow-none transition-colors"
                                                    type="button"
                                                >
                                                    <Plus size={16} strokeWidth={2.5} />
                                                </motion.button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Time Slot</label>
                                <div className={`transition-all duration-200 rounded-xl ${isSlotInvalid ? 'p-3 border-2 border-red-500 bg-red-50' : ''}`}>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(() => {
                                            if (slotStatus === 'no_schedule') return <p className="text-gray-400 text-xs col-span-3">No schedule available</p>;
                                            if (slotStatus === 'closed') return <p className="text-red-400 text-xs font-medium col-span-3">Closed on this date</p>;
                                            if (slotStatus === 'no_slots') return <p className="text-gray-400 text-xs col-span-3">No slots available</p>;

                                            return availableMinutes.map((startTimeInMinutes) => {
                                                const timeLabel = formatTime12Hour(startTimeInMinutes);
                                                return (
                                                    <button
                                                        key={startTimeInMinutes}
                                                        onClick={async () => {
                                                            // Check conflicting cart items
                                                            const newCategory = getCategoryFromTimeSlot(timeLabel);
                                                            const cartItemsList = Object.values(cart);

                                                            const conflictingItems = cartItemsList.filter(item => {
                                                                if (item.categories && Array.isArray(item.categories)) {
                                                                    return !item.categories.includes(newCategory);
                                                                }
                                                                return false;
                                                            });

                                                            if (conflictingItems.length > 0) {
                                                                const itemNames = conflictingItems.map(i => `<b>${i.name}</b>`).join("<br/>");
                                                                const result = await showConfirm(
                                                                    "Use this time slot?",
                                                                    `Switching to <b>${timeLabel}</b> (${newCategory}) will remove the following items from your cart:<br/><br/>${itemNames}`,
                                                                    "Yes, switch & clear",
                                                                    true // isHtml = true
                                                                );

                                                                if (result.isConfirmed) {
                                                                    // Clear conflicting items
                                                                    setCart(prev => {
                                                                        const nextCart = { ...prev };
                                                                        conflictingItems.forEach(ci => delete nextCart[ci._id]);
                                                                        return nextCart;
                                                                    });
                                                                    setSelectedTimeSlot(timeLabel);
                                                                    setActiveTab("menu");
                                                                }
                                                            } else {
                                                                setSelectedTimeSlot(timeLabel);
                                                                setActiveTab("menu");
                                                            }
                                                        }}
                                                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${selectedTimeSlot === timeLabel
                                                            ? "bg-[#ff5e00] text-white border-[#ff5e00] shadow-md shadow-orange-200 scale-105"
                                                            : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {timeLabel}
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                                {isSlotInvalid && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 animate-in slide-in-from-top-2 fade-in">
                                        <AlertTriangle size={14} />
                                        <p className="text-xs font-bold">Please select a valid time slot for this date</p>
                                    </div>
                                )}
                            </div>



                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                <h4 className="font-bold text-gray-900">Your Order</h4>
                                <button onClick={() => setCart({})} className="text-xs font-medium text-[#ff5e00] hover:text-[#d14d00]">Clear all</button>
                            </div>

                            <div className="space-y-4 mb-6 max-h-[200px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-gray-400">Cart is empty</div>
                                ) : (
                                    cartItems.map((item) => (
                                        <div key={item._id} className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate" title={item.name}>
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    ₹{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                                                    <button
                                                        onClick={() => handleUpdateCart(item, -1)}
                                                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-white rounded-md transition-all"
                                                    >-</button>
                                                    <span className="text-xs font-semibold text-gray-900 w-3 text-center">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleUpdateCart(item, 1)}
                                                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-white rounded-md transition-all"
                                                    >+</button>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 w-12 text-right">
                                                    ₹{(item.price * item.qty).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-2 mb-6 pt-4 border-t border-gray-50">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Booking Fee ({partySize} x ₹{pricePerPerson})</span>
                                    <span>₹{bookingFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Food Total</span>
                                    <span>₹{itemTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Tax (5%)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Platform Fee (5%)</span>
                                    <span>₹{platformFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                    <span>Total</span>
                                    <span>₹{finalTotal.toFixed(2)}</span>
                                </div>

                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleBookNow}
                                    disabled={isBooking}
                                    className="w-full bg-[#ff5e00] hover:bg-[#e05200] disabled:bg-[#ff5e00]/70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {isBooking ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Booking...</span>
                                        </div>
                                    ) : (
                                        "Book & Pre-order Now"
                                    )}
                                </button>
                                <button
                                    onClick={handleSaveWishlist}
                                    className="w-full bg-[#ff9500] hover:bg-[#e68600] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Heart size={18} className="fill-white/20" />
                                    Wishlist
                                </button>
                                <p className="text-[10px] text-center text-gray-400 mt-2">
                                    You won't be charged yet
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

            </main >
        </div >
    );
};

export default RestaurantDetails;
