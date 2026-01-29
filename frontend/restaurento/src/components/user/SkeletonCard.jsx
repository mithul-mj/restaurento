import React from "react";

const SkeletonCard = React.memo(() => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
        <div className="h-48 w-full bg-gray-200 animate-pulse shrink-0" />
        <div className="p-5 flex flex-col flex-1 gap-3">
            <div className="flex justify-between items-start">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-12 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="mt-auto h-10 border-t border-gray-50 pt-4 flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
        </div>
    </div>
));

export default SkeletonCard;
