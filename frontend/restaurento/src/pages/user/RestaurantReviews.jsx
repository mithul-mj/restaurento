import React, { useState } from 'react';
import { Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReviews } from '../../hooks/useReviews';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/timeUtils';

const RestaurantReviews = ({ restaurantId }) => {
    const [page, setPage] = useState(1);
    const { data: reviewsResponse, isLoading } = useReviews({ id: restaurantId, page, limit: 5 });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader size="md" />
            </div>
        );
    }

    const reviews = reviewsResponse?.data || [];
    const stats = reviewsResponse?.stats || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
    const pagination = reviewsResponse?.pagination || { currentPage: 1, totalPages: 1 };

    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: stats.ratingDistribution[stars] || 0
    }));

    const overallRating = stats.averageRating || 0;
    const totalReviews = stats.totalReviews || 0;
    const maxCount = Math.max(...ratingDistribution.map(d => d.count), 1);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews ({totalReviews})</h3>

            {/* Overall Rating Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
                <div className="text-center shrink-0">
                    <div className="text-6xl font-black text-[#ff5e00] mb-2">{overallRating}</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={20}
                                className={star <= Math.round(overallRating) ? "fill-[#ff9500] text-[#ff9500]" : "text-gray-200"}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 font-medium whitespace-nowrap">Based on {totalReviews} reviews</p>
                </div>

                <div className="flex-1 w-full space-y-3">
                    {ratingDistribution.map((dist) => (
                        <div key={dist.stars} className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1 w-6 shrink-0 font-bold text-gray-600">
                                {dist.stars} <Star size={12} className="fill-gray-400 text-gray-400" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(dist.count / maxCount) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-[#ff9500]"
                                />
                            </div>
                            <div className="w-10 text-right font-medium text-gray-400 shrink-0">
                                {dist.count}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Individual Reviews List */}
            <div className="space-y-8">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review._id} className="pb-8 border-b border-gray-100 last:border-0">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-50 mt-0.5">
                                        <img
                                            src={review.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId?.fullName || "User")}&background=ff5e00&color=fff`}
                                            alt={review.userId?.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.userId?.fullName || "Restaurento User"}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatDate(review.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            className={star <= review.rating ? "fill-[#ff9500] text-[#ff9500]" : "text-gray-200"}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl ml-14">
                                {review.comment}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                        <p className="text-sm text-gray-500 max-w-xs text-center">
                            Be the first to share your experience after your visit!
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                        onClick={() => {
                            setPage(p => Math.max(1, p - 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={page === 1}
                        className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={20} className="text-[#ff5e00]" />
                    </button>

                    <div className="text-sm font-black text-gray-400">
                        Page <span className="text-gray-900">{pagination.currentPage}</span> of {pagination.totalPages}
                    </div>

                    <button
                        onClick={() => {
                            setPage(p => Math.min(pagination.totalPages, p + 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={page >= pagination.totalPages}
                        className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Next page"
                    >
                        <ChevronRight size={20} className="text-[#ff5e00]" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RestaurantReviews;
