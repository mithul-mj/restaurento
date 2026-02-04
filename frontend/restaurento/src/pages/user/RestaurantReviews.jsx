import React from "react";
import { Info } from "lucide-react";

const RestaurantReviews = ({ restaurantId }) => {
    return (
        <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Info className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="font-medium">Reviews coming soon!</p>
        </div>
    );
};

export default RestaurantReviews;
