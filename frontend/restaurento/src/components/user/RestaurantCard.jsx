import React, { useState } from "react";
import { MapPin, Tag, Star } from "lucide-react";
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
        <Link to={`/restaurants/${item._id}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col will-change-transform group">
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
                        } text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide z-10`}
                >
                    {item.isCurrentlyOpen ? "OPEN" : "CLOSED"}
                </div>

                {item.bestOffer && (
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-[#ff5e00] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-orange-500/40 z-10 border border-white/20 backdrop-blur-md uppercase tracking-wider">
                        <Tag size={12} className="text-orange-50 mt-[1px]" />
                        <span>Up to ₹{item.bestOffer.discountValue} Off</span>
                    </div>
                )}

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
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1">
                        {item.restaurantName}
                    </h4>
                    {item.ratingStats && item.ratingStats.average > 0 && (
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 text-green-700 font-bold text-[13px] shrink-0 transition-all group-hover:bg-green-100/50">
                            <Star size={12} className="fill-green-600 text-green-600" />
                            <span>{item.ratingStats.average.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                    {item.tags?.join(", ") || "Classical"}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 text-sm text-gray-500">
                    <div className="flex items-start gap-1.5 flex-1 mr-4 min-h-[32px]">
                        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2 text-[11px] leading-tight text-gray-500">
                            {item.address || "Unknown"}
                        </span>
                    </div>
                    <div className="font-semibold text-gray-700">
                        ₹{item.slotPrice || 3}/slot
                    </div>
                </div>
            </div>
        </Link>
    );
});

export default RestaurantCard;
