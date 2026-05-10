import { useState } from "react";
import { Heart, Trash2, ArrowRight, ChevronLeft, ChevronRight, Utensils, Clock, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../../hooks/useWishlist";
import { showConfirm, showToast } from "../../utils/alert";
import Loader from "../../components/Loader";
import { formatDate } from "../../utils/timeUtils";

function WishlistCard({ restaurant, onRemove, index }) {
    const mealTypeColors = {
        Breakfast: "bg-amber-500",
        Lunch: "bg-orange-500",
        Dinner: "bg-gray-900",
    };

    const isClosed = restaurant.closedTill && new Date(restaurant.closedTill) > new Date();
    const hasUnavailableItems = restaurant.items.some(
        item => !item.dishDetails || item.dishDetails.isDeleted || !item.dishDetails.isAvailable
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-gray-100">
                <img
                    src={restaurant.restaurantImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"}
                    alt={restaurant.restaurantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Meal type badge */}
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white ${mealTypeColors[restaurant.mealType] || "bg-gray-800"}`}>
                    <Utensils size={10} />
                    {restaurant.mealType}
                </div>

                {/* Remove button */}
                <button
                    onClick={onRemove}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                >
                    <Trash2 size={14} strokeWidth={2} />
                </button>

                {/* Closed overlay */}
                {isClosed && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-white/95 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                            <Clock size={13} className="text-red-500" />
                            <span className="text-xs font-semibold text-gray-800">Temporarily Closed</span>
                        </div>
                    </div>
                )}

                {/* Saved date on image bottom */}
                <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-medium text-white/80">
                        Saved {formatDate(restaurant.createdAt)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Name */}
                <div>
                    <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1 mb-1">
                        {restaurant.restaurantName}
                    </h3>
                    {hasUnavailableItems && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            Some items unavailable
                        </span>
                    )}
                </div>

                {/* Pre-ordered items */}
                {restaurant.items.length > 0 ? (
                    <div className="flex-1">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                            Pre-ordered
                        </p>
                        <div className="space-y-2 max-h-[96px] overflow-y-auto pr-1 custom-scrollbar">
                            {restaurant.items.map((item, i) => {
                                const isUnavailable = !item.dishDetails || item.dishDetails.isDeleted || !item.dishDetails.isAvailable;
                                return (
                                    <div key={i} className="flex items-center justify-between gap-3">
                                        <span className={`text-xs font-medium truncate ${isUnavailable ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                                            {item.dishDetails?.name || "Unknown Dish"}
                                        </span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${isUnavailable ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 text-[#ff5e00]'}`}>
                                            ×{item.qty}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center py-4">
                        <p className="text-xs text-gray-400 font-medium">No items pre-ordered</p>
                    </div>
                )}

                {/* CTA */}
                <Link
                    to={isClosed ? "#" : `/restaurants/${restaurant.restaurantId}`}
                    state={isClosed ? null : {
                        prefilledMealType: restaurant.mealType,
                        prefilledCart: restaurant.items.reduce((acc, curr) => {
                            const isAvailable = curr.dishDetails && !curr.dishDetails.isDeleted && curr.dishDetails.isAvailable;
                            if (isAvailable) {
                                acc[curr.dishId] = { ...curr.dishDetails, _id: curr.dishId, qty: curr.qty };
                            }
                            return acc;
                        }, {})
                    }}
                    onClick={(e) => {
                        if (isClosed) {
                            e.preventDefault();
                            showToast("This restaurant is temporarily closed.", "info");
                            return;
                        }
                        if (hasUnavailableItems) {
                            showToast("Some items from your plan are no longer available and were skipped.", "warning");
                        }
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        isClosed
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#ff5e00] text-white hover:bg-[#e05200] shadow-sm shadow-orange-100 active:scale-95'
                    }`}
                >
                    {isClosed ? "Closed" : (
                        <>Book Now <ArrowRight size={15} /></>
                    )}
                </Link>
            </div>
        </motion.div>
    );
}

export default function Wishlist() {
    const [page, setPage] = useState(1);
    const limit = 6;

    const { data, isLoading, isError, removeItem } = useWishlist({ page, limit });

    const handleRemove = (id, name) => {
        showConfirm("Remove from Wishlist?", `Remove ${name} from your wishlist?`, "Remove")
            .then(res => res.isConfirmed && removeItem(id));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader size="medium" showText={true} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 text-sm font-medium mb-4">Error loading wishlist.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[#ff5e00] text-white rounded-xl text-sm font-semibold shadow-sm">
                    Retry
                </button>
            </div>
        );
    }

    const restaurants = data?.wishlists || [];
    const pagination = data?.pagination || { currentPage: 1, totalPages: 1, hasPrevPage: false, hasNextPage: false };

    return (
        <div className="min-h-full bg-[#fcfcfc] pb-32">
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">My Wishlist</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        {restaurants.length > 0
                            ? `${restaurants.length} saved restaurant${restaurants.length > 1 ? 's' : ''}`
                            : "Your saved restaurants and pre-planned meals."}
                    </p>
                </div>

                {/* Empty State */}
                {restaurants.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-dashed border-gray-200 py-24 text-center"
                    >
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Heart className="text-[#ff5e00]" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-sm text-gray-500 font-medium mb-6 max-w-xs mx-auto">
                            Save restaurants you love and plan your next meal in advance.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ff5e00] text-white rounded-xl font-semibold text-sm hover:bg-[#e05300] transition-all shadow-sm shadow-orange-100"
                        >
                            Discover Restaurants
                            <ArrowRight size={15} />
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Grid */}
                        <AnimatePresence mode="popLayout">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {restaurants.map((r, i) => (
                                    <WishlistCard
                                        key={r._id}
                                        restaurant={r}
                                        index={i}
                                        onRemove={() => handleRemove(r._id, r.restaurantName)}
                                    />
                                ))}
                            </div>
                        </AnimatePresence>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                                <p className="text-xs text-gray-400 font-medium">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={!pagination.hasPrevPage}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#ff5e00] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={16} strokeWidth={2} />
                                    </button>
                                    <button
                                        disabled={!pagination.hasNextPage}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#ff5e00] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronRight size={16} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
