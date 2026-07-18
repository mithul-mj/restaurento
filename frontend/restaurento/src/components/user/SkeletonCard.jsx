import React from "react";

const SkeletonCard = React.memo(() => (
    <div
        className="relative rounded-2xl overflow-hidden shadow-md h-full flex flex-col cursor-wait"
        style={{ aspectRatio: "3/3", minHeight: 280 }}
    >
        {/* Background base */}
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />

        {/* Dark gradient overlay to match loaded card */}
        <div
            className="absolute inset-0"
            style={{
                background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.88) 100%)",
            }}
        />

        {/* Top Badges Skeletons */}
        <div className="absolute top-3 left-3 w-24 h-7 bg-white/20 rounded-full animate-pulse backdrop-blur-md" />
        <div className="absolute top-3 right-3 w-16 h-7 bg-white/20 rounded-full animate-pulse backdrop-blur-md" />

        {/* Bottom Info Block Skeletons */}
        <div className="relative z-10 mt-auto px-4 pb-0">
            {/* Title */}
            <div className="w-2/3 h-6 bg-white/20 rounded animate-pulse" />
            
            {/* Tags */}
            <div className="w-1/2 h-3 bg-white/20 rounded animate-pulse mt-1" />
            
            {/* Info Row (Rating, Distance, Avail) */}
            <div className="flex gap-2 mt-2">
                <div className="w-10 h-4 bg-white/20 rounded animate-pulse" />
                <div className="w-16 h-4 bg-white/20 rounded animate-pulse" />
                <div className="w-14 h-4 bg-white/20 rounded animate-pulse" />
            </div>

            {/* Divider */}
            <div className="border-t border-white/20 mt-3" />

            {/* Location & Price */}
            <div className="flex justify-between items-center gap-3 py-3">
                <div className="flex-1">
                    <div className="w-3/4 h-3 bg-white/20 rounded animate-pulse mb-1.5" />
                    <div className="w-1/2 h-3 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="w-16 h-8 bg-white/20 rounded animate-pulse" />
            </div>
        </div>
    </div>
));

export default SkeletonCard;
