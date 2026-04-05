import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Star,
    MapPin, Clock, Phone, Heart, ChevronRight, ChevronDown, Minus, Plus, Calendar, Check, AlertTriangle, Armchair, Tag, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import userService from "../../services/user.service";
import LocationViewer from "../../components/shared/LocationViewer";
import ImageGallery from "../../components/shared/ImageGallery";
import RestaurantMenu from "./RestaurantMenu";
import RestaurantReviews from "./RestaurantReviews";
import { TAX_RATE, PLATFORM_FEE_RATE, BOOKING_BUFFER_MINUTES } from "../../constants/constants";
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
    const [partySize, setPartySize] = useState(Number(location.state?.prefilledGuests || 2));
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [cart, setCart] = useState(location.state?.prefilledCart || {});
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [liveSlotAvailability, setLiveSlotAvailability] = useState({});
    const [isBooking, setIsBooking] = useState(false);
    const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (location.state?.prefilledCart || location.state?.prefilledGuests) {
            const newState = { ...location.state };
            delete newState.prefilledCart;
            delete newState.prefilledGuests;
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
        <div className="min-h-screen bg-[#fcfcfc] pb-32">
            {/* Mobile Bottom Booking Bar */}
            {isMobile && cartItems.length > 0 && activeTab !== "book-a-seat" && (
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-6 left-4 right-4 z-50 bg-[#1a1a1a] text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-black/20"
                >
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</p>
                        <p className="text-lg font-black tracking-tight">₹{finalTotal.toFixed(2)}</p>
                    </div>
                    <button 
                        onClick={() => setActiveTab("book-a-seat")}
                        className="bg-[#ff5e00] px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 active:scale-95 transition-transform"
                    >
                        Review Booking <ChevronRight size={16} strokeWidth={3} />
                    </button>
                </motion.div>
            )}

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
                        <div className="mb-4">
                             <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2.5 tracking-tight">
                                {restaurant.restaurantName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                {restaurant.ratingStats?.count > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-bold">
                                        <Star size={14} className="fill-green-700" />
                                        <span>{restaurant.ratingStats.average}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    <span>{restaurant.ratingStats.count || 0} reviews</span>
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    <span className="text-[#ff5e00] font-bold">₹{pricePerPerson.toFixed(0)} per head</span>
                                </div>
                            </div>
                        </div>

                         {/* Mobile-only Premium Offers Section */}
                        {isMobile && restaurant.offers && restaurant.offers.length > 0 && (
                            <div className="mb-8 -mx-4 px-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Offers</h3>
                                    <div className="flex gap-2 text-[#ff5e00]">
                                        <Tag size={14} />
                                    </div>
                                </div>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                    {restaurant.offers.map((offer, idx) => (
                                        <div 
                                            key={offer._id || idx}
                                            className="min-w-[calc(100vw-64px)] bg-gradient-to-br from-[#ff5e00] to-[#ff9100] p-5 rounded-2xl text-white relative overflow-hidden group shadow-lg shadow-orange-100/50"
                                        >
                                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full transition-transform group-hover:scale-125"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className="text-2xl font-black">₹{offer.discountValue} OFF</p>
                                                    <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">PROMO</span>
                                                </div>
                                                <p className="text-white/90 text-xs font-medium mb-2">
                                                    {offer.minOrderValue > 0 ? `Orders above ₹${offer.minOrderValue}` : 'Flat discount on any order'}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] bg-black/10 w-fit px-2 py-1 rounded-md">
                                                    <Check size={10} strokeWidth={4} />
                                                    <span className="font-bold">APPLIED AT CHECKOUT</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        <div className="sticky top-0 z-[40] bg-[#fcfcfc] flex items-center justify-between md:justify-start md:gap-8 border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar pt-2">
                            {(isMobile 
                                ? ["About", "Menu", "Reviews", "Book a seat"] 
                                : ["About", "Menu", "Reviews"]
                            ).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase().replace(/ /g, '-'))}
                                    className={`relative flex-1 md:flex-none pb-4 text-xs md:text-base font-medium transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase().replace(/ /g, '-')
                                        ? "text-[#ff5e00]"
                                        : "text-gray-500 hover:text-gray-800"
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab.toLowerCase().replace(/ /g, '-') && (
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

                            {activeTab === "book-a-seat" && (
                                <motion.div
                                    key="book-a-seat"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="lg:hidden"
                                >
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Complete Your Booking</h3>
                                        {/* Scheduling Section for Mobile Tab */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Date</label>
                                                <div className="relative">
                                                     <button
                                                        onClick={() => setIsDateOpen(!isDateOpen)}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 h-[46px] text-sm font-medium flex items-center gap-2"
                                                    >
                                                        <Calendar size={16} className="text-[#ff5e00]" />
                                                        <span className="flex-1 text-left text-gray-900">
                                                            {dateOptions.find(d => d.value === selectedDate)?.label || selectedDate}
                                                        </span>
                                                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {isDateOpen && (
                                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-[60] overflow-hidden">
                                                            {dateOptions.map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => {
                                                                        setSelectedDate(option.value);
                                                                        setIsDateOpen(false);
                                                                    }}
                                                                    className={`w-full px-4 py-3 text-sm text-left hover:bg-orange-50 ${selectedDate === option.value ? 'bg-orange-50 text-[#ff5e00] font-bold' : 'text-gray-600'}`}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Party Size</label>
                                                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-1 h-[48px]">
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setPartySize(Math.max(1, Number(partySize) - 1))}
                                                        disabled={partySize <= 1}
                                                        className="w-9 h-full flex items-center justify-center bg-white rounded-xl text-gray-500 shadow-sm hover:text-[#ff5e00] disabled:opacity-50 disabled:shadow-none transition-colors"
                                                        type="button"
                                                    >
                                                        <Minus size={16} strokeWidth={2.5} />
                                                    </motion.button>
                                                    
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-black text-gray-900 leading-none">{partySize}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Guests</span>
                                                    </div>

                                                    {(() => {
                                                        const selectedSlotIndex = availableLabels.indexOf(selectedTimeSlot);
                                                        const selectedSlotMinutes = selectedSlotIndex >= 0 ? availableMinutes[selectedSlotIndex] : null;
                                                        const liveAvailableSeats = selectedSlotMinutes !== null && liveSlotAvailability[selectedSlotMinutes] !== undefined
                                                            ? liveSlotAvailability[selectedSlotMinutes]
                                                            : restaurant?.totalSeats || 10;

                                                        const maxAllowedPartySize = Math.max(1, Math.min(10, restaurant?.totalSeats || 10, liveAvailableSeats));

                                                        return (
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => setPartySize(Math.min(maxAllowedPartySize, Number(partySize) + 1))}
                                                                disabled={partySize >= maxAllowedPartySize}
                                                                className="w-9 h-full flex items-center justify-center bg-white rounded-xl text-gray-500 shadow-sm hover:text-[#ff5e00] disabled:opacity-50 disabled:shadow-none transition-colors"
                                                                type="button"
                                                            >
                                                                <Plus size={16} strokeWidth={2.5} />
                                                            </motion.button>
                                                        );
                                                    })()}
                                                </div>
                                                
                                                {/* Subtle Seat Availability UI for Mobile Tab */}
                                                {(() => {
                                                    const selectedSlotIndex = availableLabels.indexOf(selectedTimeSlot);
                                                    const selectedSlotMinutes = selectedSlotIndex >= 0 ? availableMinutes[selectedSlotIndex] : null;
                                                    const seatsLeft = selectedSlotMinutes !== null && liveSlotAvailability[selectedSlotMinutes] !== undefined
                                                        ? liveSlotAvailability[selectedSlotMinutes]
                                                        : null;

                                                    if (seatsLeft === null) return null;

                                                    return (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="mt-2 flex items-center gap-1.5 text-gray-400"
                                                        >
                                                            <Armchair size={13} className="text-[#ff5e00]/40" />
                                                            <span className="text-[10px] font-bold">
                                                                {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} available for this slot
                                                            </span>
                                                        </motion.div>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Select Time</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {availableLabels.map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTimeSlot(time)}
                                                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${selectedTimeSlot === time ? 'bg-[#ff5e00] text-white border-[#ff5e00]' : 'bg-white border-gray-100 text-gray-600'}`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-50 pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-900">Order Summary</h4>
                                                {cartItems.length > 0 && <span className="text-xs text-gray-400">{cartItems.length} items</span>}
                                            </div>
                                            
                                            {cartItems.length === 0 ? (
                                                <div className="text-center py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                                    <p className="text-sm text-gray-500 mb-3 px-6">Your order is empty. Select some delicious items to proceed.</p>
                                                    <button 
                                                        onClick={() => setActiveTab("menu")} 
                                                        className="px-6 py-2 bg-white text-[#ff5e00] text-xs font-black uppercase tracking-widest rounded-full shadow-sm border border-orange-100 hover:bg-orange-50 active:scale-95 transition-all"
                                                    >
                                                        Add a dish
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 mb-6">
                                                    {cartItems.map((item) => (
                                                        <div key={item._id} className="flex justify-between items-center">
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                                <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {(cartItems.length > 0 || selectedTimeSlot) && (
                                                <div className="space-y-2 mb-6 pt-6 border-t border-gray-50 px-1">
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
                                                    <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t border-gray-100 mt-3">
                                                        <span>Total</span>
                                                        <span>₹{finalTotal.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <button
                                                    onClick={handleBookNow}
                                                    disabled={isBooking || cartItems.length === 0 || !selectedTimeSlot}
                                                    className="w-full py-4 bg-[#ff5e00] text-white rounded-2xl font-black shadow-lg shadow-orange-200 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3"
                                                >
                                                    {isBooking ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            <span>BOOKING...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>CONFIRM BOOKING</span>
                                                            <ChevronRight size={18} strokeWidth={3} />
                                                        </>
                                                    )}
                                                </button>
                                                
                                                <button
                                                    onClick={handleSaveWishlist}
                                                    className="w-full py-3.5 bg-orange-50 text-[#ff5e00] font-bold rounded-2xl transition-all border border-orange-100 flex items-center justify-center gap-2"
                                                >
                                                    <Heart size={18} className="fill-[#ff5e00]/10" />
                                                    Wishlist for later
                                                </button>
                                                
                                                <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
                                                    Fastest booking confirmation in the city
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="lg:col-span-1">
                        {/* Highlights/Offers Section - HIDDEN ON MOBILE (Moved to Top) */}
                        {!isMobile && restaurant.offers && restaurant.offers.length > 0 && (
                            <div className="mb-6 lg:block hidden">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Available Offers</h3>
                                    {restaurant.offers.length > 1 && (
                                        <button
                                            onClick={() => setIsOffersModalOpen(true)}
                                            className="text-xs font-bold text-[#ff5e00] hover:underline"
                                        >
                                            View all ({restaurant.offers.length})
                                        </button>
                                    )}
                                </div>

                                <motion.div
                                    whileHover={{ y: -2 }}
                                    className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff5e00]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                                    <div className="flex items-start gap-3 relative z-10">
                                        <div className="bg-[#ff5e00] text-white p-2 rounded-xl shadow-md shadow-orange-200">
                                            <Tag size={18} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900">
                                                ₹{restaurant.offers[0].discountValue} OFF
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {restaurant.offers[0].minOrderValue > 0
                                                    ? `On orders above ₹${restaurant.offers[0].minOrderValue}`
                                                    : 'No minimum order value'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-orange-100/50 flex items-center justify-between">
                                        <span className="text-[10px] bg-[#ff5e00] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Best Deal</span>
                                        <span className="text-[10px] text-gray-400 font-medium italic">Applied at checkout</span>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        <div className="hidden lg:block sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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
                                                : restaurant?.totalSeats || 10;

                                            const maxAllowedPartySize = Math.max(1, Math.min(10, restaurant?.totalSeats || 10, liveAvailableSeats));

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

                                    {/* Subtle Seat Availability UI */}
                                    {(() => {
                                        const selectedSlotIndex = availableLabels.indexOf(selectedTimeSlot);
                                        const selectedSlotMinutes = selectedSlotIndex >= 0 ? availableMinutes[selectedSlotIndex] : null;
                                        const seatsLeft = selectedSlotMinutes !== null && liveSlotAvailability[selectedSlotMinutes] !== undefined
                                            ? liveSlotAvailability[selectedSlotMinutes]
                                            : null;

                                        if (seatsLeft === null) return null;

                                        return (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-1.5 flex items-center gap-1.5 text-gray-400"
                                            >
                                                <Armchair size={13} className="text-gray-300" />
                                                <span className="text-[11px] font-medium">
                                                    {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} left, hurry up!
                                                </span>
                                            </motion.div>
                                        );
                                    })()}
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
                                                            const availableSeats = liveSlotAvailability[startTimeInMinutes];

                                                            // Handle fully booked slots
                                                            if (availableSeats === 0) {
                                                                showToast(`Sorry, ${timeLabel} is now fully booked!`, 'info');
                                                                return;
                                                            }

                                                            // Handle partial availability by asking to adjust party size
                                                            if (availableSeats !== undefined && availableSeats < partySize) {
                                                                const confirmAdjust = await showConfirm(
                                                                    "Adjust Party Size?",
                                                                    `Only <b>${availableSeats}</b> seats are available at ${timeLabel}. Do you want to reduce your party size to <b>${availableSeats}</b> and select this slot?`,
                                                                    "Yes, Adjust",
                                                                    true // isHtml
                                                                );

                                                                if (confirmAdjust.isConfirmed) {
                                                                    setPartySize(availableSeats);
                                                                } else {
                                                                    return;
                                                                }
                                                            }

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
                                                        className={`relative py-2 text-xs font-semibold rounded-lg border transition-all ${selectedTimeSlot === timeLabel
                                                            ? "bg-[#ff5e00] text-white border-[#ff5e00] shadow-md shadow-orange-200 scale-105"
                                                            : (liveSlotAvailability[startTimeInMinutes] === 0
                                                                ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60"
                                                                : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50")
                                                            }`}
                                                    >
                                                        {timeLabel}
                                                        {liveSlotAvailability[startTimeInMinutes] === 0 && (
                                                            <span className="absolute -top-1.5 -right-1.5 px-1 bg-red-500 text-[8px] text-white rounded-md font-black uppercase tracking-tighter shadow-sm">Full</span>
                                                        )}
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
                                    <div className="text-center py-4 text-xs text-gray-400">
                                        no dishes added - <span onClick={() => setActiveTab("menu")} className="text-[#ff5e00] font-bold cursor-pointer hover:underline">add a dish</span>
                                    </div>
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

            {/* Offers Modal */}
            <AnimatePresence>
                {isOffersModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOffersModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#ff5e00] p-2 rounded-xl text-white">
                                        <Tag size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">Available Offers</h3>
                                </div>
                                <button
                                    onClick={() => setIsOffersModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                                {restaurant.offers?.map((offer, idx) => (
                                    <div key={offer._id} className="group border border-gray-100 rounded-2xl p-4 hover:border-[#ff5e00]/30 hover:bg-orange-50/10 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-2xl font-black text-[#ff5e00]">₹{offer.discountValue} OFF</p>
                                            <div className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Code Auto-Applied</div>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800 mb-1">Exclusive Restaurant Offer</p>
                                        <p className="text-xs text-gray-500">
                                            {offer.minOrderValue > 0
                                                ? `Valid on bookings above ₹${offer.minOrderValue}`
                                                : 'No minimum booking value required'}
                                        </p>
                                        {idx === 0 && (
                                            <div className="mt-3 inline-block bg-[#ff5e00]/10 text-[#ff5e00] text-[10px] font-black px-2 py-1 rounded shadow-sm">MOST POPULAR</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-gray-50 text-center">
                                <button
                                    onClick={() => setIsOffersModalOpen(false)}
                                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default RestaurantDetails;
