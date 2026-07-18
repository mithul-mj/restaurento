import React, { useState } from "react";
import { MapPin, Tag, Star, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500&auto=format&fit=crop";

const RestaurantCard = React.memo(({ item }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const getOptimizedImageUrl = (url) => {
        if (!url) return FALLBACK_IMAGE;
        if (url.includes("unsplash.com")) {
            return `${url}&w=500&q=80&auto=format&fit=crop`;
        }
        return url;
    };

    /* cuisine tags formatted as "indian • keralafood • continental •..." */
    const cuisineLine = item.tags?.length
        ? item.tags.join(" • ")
        : "Classical";

    return (
        <Link
            to={`/restaurants/${item._id}`}
            className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col will-change-transform group cursor-pointer"
            style={{ aspectRatio: "3/3", minHeight: 280 }}
        >
            {/* ── Full-bleed image ── */}
            <img
                src={getOptimizedImageUrl(item.images?.[0])}
                alt={item.restaurantName}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
            />

            {/* skeleton shimmer while loading */}
            {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-300 animate-pulse" />
            )}

            {/* ── dark gradient overlay ── */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.88) 100%)",
                }}
            />

            {/* ── Offer badge – absolute top-left ── */}
            {item.bestOffer && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-[#ff5e00] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg shadow-orange-600/50 border border-orange-300/30 backdrop-blur-sm uppercase tracking-wider">
                    <Tag size={10} className="text-orange-100 shrink-0" />
                    <span>Up to ₹{item.bestOffer.discountValue} Off</span>
                </div>
            )}

            {/* ── Open / Closed badge – absolute top-right ── */}
            <div
                className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 text-white text-[10px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md tracking-widest uppercase ${item.isCurrentlyOpen
                    ? "bg-black/30 border-green-400/40 shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                    : "bg-black/30 border-red-400/40 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                    }`}
            >
                {/* glowing dot */}
                <span className="relative flex h-2 w-2 shrink-0">
                    <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.isCurrentlyOpen ? "bg-green-400" : "bg-red-400"
                            }`}
                    />
                    <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${item.isCurrentlyOpen ? "bg-green-400" : "bg-red-400"
                            }`}
                    />
                </span>
                {item.isCurrentlyOpen ? "Open" : "Closed"}
            </div>

            {/* ── BOTTOM text block (overlaid on gradient) ── */}
            <div className="relative z-10 mt-auto px-4 pb-0">
                {/* Restaurant name */}
                <h4 className="text-white font-bold text-xl leading-tight line-clamp-1 drop-shadow-sm">
                    {item.restaurantName}
                </h4>

                {/* Cuisine tags */}
                <p className="text-white/75 text-[12px] mt-0.5 line-clamp-1">
                    {cuisineLine}
                </p>

                {/* ── Single info row: rating • distance • availability ── */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {item.ratingStats && item.ratingStats.average > 0 && (
                        <>
                            <div className="flex items-center gap-1">
                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-white text-[12px] font-semibold">
                                    {item.ratingStats.average.toFixed(1)}
                                </span>
                            </div>
                            <span className="text-white/40 text-[10px]">•</span>
                        </>
                    )}

                    {item.distanceFromUser !== undefined && item.distanceFromUser !== null && (
                        <>
                            <div className="flex items-center gap-1">
                                <Navigation size={11} className="text-white/70" />
                                <span className="text-white/80 text-[12px] font-medium">
                                    {item.distanceFromUser < 1000
                                        ? `${Math.round(item.distanceFromUser)} m`
                                        : `${(item.distanceFromUser / 1000).toFixed(1)} km`}
                                </span>
                            </div>
                            <span className="text-white/40 text-[10px]">•</span>
                        </>
                    )}

                    <span
                        className={`text-[12px] font-semibold ${item.isCurrentlyOpen ? "text-green-400" : "text-red-400"
                            }`}
                    >
                        {item.isCurrentlyOpen ? "Available" : "Unavailable"}
                    </span>
                </div>

                {/* ── Divider line ── */}
                <div className="border-t border-white/20 mt-3" />

                {/* ── Location + slot price ── */}
                <div className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        <MapPin size={13} className="text-white/60 mt-0.5 shrink-0" />
                        <span className="text-white/80 text-[11px] font-medium line-clamp-2 leading-snug">
                            {item.address || "Unknown location"}
                        </span>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-white/55 text-[9px] font-medium uppercase tracking-wide">
                            Starting at
                        </p>
                        <p className="text-white font-bold text-sm leading-tight">
                            ₹{item.slotPrice || 3}
                            <span className="text-white/60 text-[10px] font-medium">/slot</span>
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
});

export default RestaurantCard;
