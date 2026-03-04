import { useState } from "react";
import { Heart, Trash2, ArrowRight, ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../hooks/useWishlist";
import { showConfirm } from "../../utils/alert";
import Loader from "../../components/Loader";
import { formatDate } from "../../utils/timeUtils";



function WishlistCard({ restaurant, onRemove }) {
    const mealTypeColors = {
        Breakfast: "bg-[#00a36c] text-white",
        Lunch: "bg-[#ff9500] text-white",
        Dinner: "bg-[#1a1a1a] text-white",
    };

    return (
        <div className="group h-full bg-white rounded-[24px] border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Image section */}
            <div className="relative h-[220px] overflow-hidden">
                <img
                    src={restaurant.restaurantImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"}
                    alt={restaurant.restaurantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Meal Type Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg ${mealTypeColors[restaurant.mealType] || "bg-gray-800 text-white"}`}>
                    <Utensils size={12} />
                    {restaurant.mealType}
                </div>
            </div>

            <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex justify-between items-start min-h-[56px]">
                    <div className="flex-1 mr-4">
                        <h3 className="text-xl font-extrabold text-gray-900 leading-tight line-clamp-2">{restaurant.restaurantName}</h3>
                    </div>
                    <button
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                        <Trash2 size={18} strokeWidth={2} />
                    </button>
                </div>

                <div className="bg-[#f8fafc] rounded-2xl p-5 border border-gray-100/50">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-4">
                        <Utensils size={12} className="text-[#ff5e00]" />
                        Pre-ordered Items
                    </div>
                    <div className="flex flex-col gap-3.5 h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                        {restaurant.items.length > 0 ? (
                            restaurant.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700 truncate mr-4">{item.dishDetails?.name || "Dish"}</span>
                                    <span className="px-2 py-0.5 bg-orange-100 text-[#ff5e00] text-[10px] font-black rounded-lg shrink-0">
                                        x{item.qty}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <span className="text-xs italic">No items pre-ordered</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-2">
                    <div>
                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Saved on</div>
                        <div className="text-xs font-bold text-gray-500 mt-0.5 tracking-tight">{formatDate(restaurant.createdAt)}</div>
                    </div>
                    <Link
                        to={`/restaurants/${restaurant.restaurantId}`}
                        state={{
                            prefilledCart: restaurant.items.reduce((acc, curr) => {
                                if (curr.dishDetails) {
                                    acc[curr.dishId] = { ...curr.dishDetails, _id: curr.dishId, qty: curr.qty };
                                }
                                return acc;
                            }, {})
                        }}
                        className="bg-[#f27b21] text-white text-sm font-bold px-8 py-3 rounded-2xl hover:bg-[#e06a12] transition-all shadow-lg shadow-orange-500/10 active:scale-95"
                    >
                        Book Now →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Wishlist() {
    const [page, setPage] = useState(1);
    const limit = 3;

    const { data, isLoading, isError, removeItem } = useWishlist({ page, limit });

    const handleRemove = (id, name) => {
        showConfirm("Remove Item?", `Are you sure you want to remove ${name} from your wishlist?`, "Remove")
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
                <p className="text-red-500 font-medium mb-4">Error loading wishlist.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#ff5e00] text-white rounded-lg text-sm font-bold">
                    Retry
                </button>
            </div>
        );
    }

    const restaurants = data?.wishlists || [];
    const pagination = data?.pagination || { currentPage: 1, totalPages: 1, hasPrevPage: false, hasNextPage: false };

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans">
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">My Wishlist</h1>
                        <p className="text-gray-500 text-sm">Your saved restaurants and pre-planned meals.</p>
                    </div>
                </div>

                {restaurants.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm py-24 text-center">
                        <div className="w-16 h-16 bg-[#fff5eb] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-[#ff5e00] opacity-40" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Your wishlist is empty</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                            Explore our top-rated restaurants and save your favorites here.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ff5e00] text-white rounded-xl font-semibold text-sm hover:bg-[#e05300] transition-colors shadow-md shadow-orange-100"
                        >
                            Discover Restaurants
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {restaurants.map((r) => (
                                <WishlistCard
                                    key={r._id}
                                    restaurant={r}
                                    onRemove={() => handleRemove(r._id, r.restaurantName)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-10">
                                <button
                                    disabled={!pagination.hasPrevPage}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>

                                <span className="text-sm text-gray-500 font-medium">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>

                                <button
                                    disabled={!pagination.hasNextPage}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
