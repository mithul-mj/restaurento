import React, { useState } from "react";
import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500&auto=format&fit=crop";

const RestaurantCard = React.memo(({ item }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const getOptimizedImageUrl = (url) => {
        if (!url) return FALLBACK_IMAGE;
        if (url.includes("unsplash.com")) {
            return `${url}&w=500&q=80&auto=format&fit=crop`;
        }
        return url;
    };

    return (
        <Link to={`/restaurant/${item._id}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col will-change-transform group">
            <div className="relative h-48 w-full overflow-hidden shrink-0 bg-gray-200">
                <img
                    src={getOptimizedImageUrl(item.images?.[0])}
                    alt={item.restaurantName}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover hover:scale-110 transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        }`}
                />
                <div
                    className={`absolute top-4 right-4 ${item.isCurrentlyOpen ? "bg-green-500" : "bg-red-500"
                        } text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}
                >
                    {item.isCurrentlyOpen ? "OPEN" : "CLOSED"}
                </div>

                {item.distanceFromUser !== undefined && item.distanceFromUser !== null && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <MapPin size={10} className="text-[#ff9500]" />
                        <span>
                            {item.distanceFromUser < 1000
                                ? `${Math.round(item.distanceFromUser)} m`
                                : `${(item.distanceFromUser / 1000).toFixed(1)} km`}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {item.restaurantName}
                    </h4>
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
                        <span>{item.ratingStats?.average || "New"}</span>
                        <Star size={10} fill="currentColor" />
                    </div>
                </div>

                <p className="text-xs text-gray-400 font-medium mb-3">
                    ({item.ratingStats?.count || 0} ratings)
                </p>

                <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                    {item.tags?.join(", ") || "Clasical"}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="line-clamp-1 max-w-[100px]">
                            {item.address || "Unknown"}
                        </span>
                    </div>
                    <div className="font-semibold text-gray-700">
                        ${item.slotPrice || 3}/slot
                    </div>
                </div>
            </div>
        </Link>
    );
});

export default RestaurantCard;
