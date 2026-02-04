import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import userService from "../../services/user.service";
import useDebounce from "../../hooks/useDebounce";

const RestaurantMenu = ({ restaurantId, cart, updateCart, selectedTimeSlot }) => {
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [limit] = useState(6);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [category, debouncedSearch]);

    // select category based on time slot
    useEffect(() => {
        if (selectedTimeSlot) {
            const timeParts = selectedTimeSlot.match(/(\d+):(\d+)\s(AM|PM)/);
            if (timeParts) {
                let hour = parseInt(timeParts[1]);
                const ampm = timeParts[3];
                if (ampm === "PM" && hour !== 12) hour += 12;
                if (ampm === "AM" && hour === 12) hour = 0;

                // Simple logic: Breakfast < 11, Lunch < 16, Dinner >= 16
                if (hour < 11) setCategory("Breakfast");
                else if (hour < 16) setCategory("Lunch");
                else setCategory("Dinner");
            }
        }
    }, [selectedTimeSlot]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["restaurant_menu", restaurantId, page, category, debouncedSearch],
        queryFn: () => userService.getRestaurantMenu(restaurantId, page, category, debouncedSearch),
        placeholderData: keepPreviousData,
    });

    const menuItems = data?.menu || [];
    const pagination = data?.pagination || {};

    // Check if item is roughly available for the selected slot
    const isItemAvailableForSlot = (item) => {
        if (!selectedTimeSlot) return true; // Available if no slot selected
        if (category === "All") return true;

        return true;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
        }
    };

    if (isLoading && page === 1) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff5e00]"></div>
            </div>
        );
    }

    if (isError) {
        return <div className="text-center py-12 text-red-500">Failed to load menu.</div>;
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AnimatePresence>
                {(() => {
                    if (!selectedTimeSlot) return null;

                    const timeParts = selectedTimeSlot.match(/(\d+):(\d+)\s(AM|PM)/);
                    if (!timeParts) return null;

                    let hour = parseInt(timeParts[1]);
                    const ampm = timeParts[3];
                    if (ampm === "PM" && hour !== 12) hour += 12;
                    if (ampm === "AM" && hour === 12) hour = 0;

                    let slotCategory = "Dinner";
                    if (hour < 11) slotCategory = "Breakfast";
                    else if (hour < 16) slotCategory = "Lunch";

                    if (slotCategory !== category && category !== "All") {
                        return (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex gap-3">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                                    <p className="text-xs text-amber-800 font-medium">
                                        You've selected {selectedTimeSlot} slot but are viewing {category} items. Some items might not be available.
                                    </p>
                                </div>
                            </motion.div>
                        );
                    }
                    return null;
                })()}
            </AnimatePresence>

            {/* Categories & Search Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {["All", "Breakfast", "Lunch", "Dinner"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${category === cat
                                ? "bg-[#ff5e00] text-white shadow-md shadow-orange-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder={`Search in ${category} menu...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-full pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
                {menuItems.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No items found in this category.
                    </div>
                ) : (
                    menuItems.map((item) => {
                        const cartItem = cart[item._id]?.qty || 0;
                        const imageUrl = item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                        const isAvailable = item.isAvailable !== false;

                        return (
                            <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group h-fit">
                                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                    <img loading="lazy" src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                            {!isAvailable && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-md">Unavailable</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                            {item.description || "Freshly prepared with quality ingredients."}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="font-bold text-[#ff5e00]">
                                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                        </span>

                                        {isAvailable ? (
                                            cartItem > 0 ? (
                                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateCart(item, -1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-gray-600 shadow-sm hover:scale-105 transition-transform"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold text-gray-900">{cartItem}</span>
                                                    <button
                                                        onClick={() => updateCart(item, 1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-gray-600 shadow-sm hover:scale-105 transition-transform"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => updateCart(item, 1)}
                                                    className="px-6 py-1.5 bg-[#ff5e00] text-white text-xs font-bold rounded-full hover:bg-[#e05200] active:scale-95 transition-all shadow-md shadow-orange-100"
                                                >
                                                    + Add
                                                </button>
                                            )
                                        ) : (
                                            <button disabled className="px-4 py-1.5 bg-gray-100 text-gray-400 text-xs font-bold rounded-full cursor-not-allowed">
                                                Sold Out
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {pagination.totalPages > 0 && (
                <div className="mt-8 flex justify-center gap-4 items-center">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="text-sm font-semibold text-gray-600">
                        Page {page} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RestaurantMenu;
