import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Star, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema } from "../../schemas/reviewSchema";
import { useReviews, useExistingReview } from "../../hooks/useReviews";
import { showToast } from "../../utils/alert";

const RatingModal = ({ isOpen, onClose, restaurantId, restaurantName }) => {
    const [hover, setHover] = useState(0);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: ""
        }
    });

    const rating = watch("rating");
    const comment = watch("comment");

    const { submitReview, isSubmitting } = useReviews({ id: restaurantId });
    const { data: existingReviewRes, isLoading } = useExistingReview(isOpen ? restaurantId : null);

    useEffect(() => {
        if (isOpen && existingReviewRes?.review) {
            reset({
                rating: existingReviewRes.review.rating,
                comment: existingReviewRes.review.comment || ""
            });
        } else if (!isOpen) {
            reset({ rating: 0, comment: "" });
            setHover(0);
        }
    }, [isOpen, existingReviewRes, reset]);

    const onFormSubmit = (data) => {
        submitReview({
            restaurantId,
            ...data
        }, {
            onSuccess: () => onClose()
        });
    };

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between p-8 pb-0">
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">Share Your Experience</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <Loader2 className="animate-spin text-[#ff5e00]" size={32} />
                                <p className="text-sm text-gray-400 font-medium">Loading your details...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Your Rating
                                    </h3>
                                    <div className="flex gap-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setValue("rating", star, { shouldValidate: true })}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(0)}
                                                className="relative focus:outline-none"
                                            >
                                                <Star
                                                    size={32}
                                                    className={`transition-all duration-200 ${(hover || rating) >= star
                                                        ? "fill-[#ff9500] text-[#ff9500]"
                                                        : "text-gray-200"
                                                        } ${errors.rating ? "text-red-100" : ""}`}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    {errors.rating && (
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle size={12} /> {errors.rating.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Your Review
                                    </h3>
                                    <div className="relative">
                                        <textarea
                                            {...register("comment")}
                                            placeholder="What did you like or dislike? What was your experience like?"
                                            className={`w-full bg-gray-50 border-2 rounded-2xl p-6 text-sm font-medium text-gray-700 h-40 resize-none transition-all outline-none ${errors.comment ? "border-red-100 bg-red-50/10 focus:border-red-500" : "border-transparent focus:border-[#ff5e00]/20"}`}
                                        />
                                        <div className={`absolute bottom-4 right-4 text-[10px] font-bold ${comment?.length < 10 && comment?.length > 0 ? "text-red-400" : "text-gray-400"}`}>
                                            {comment?.length || 0} / 500
                                        </div>
                                    </div>
                                    {errors.comment && (
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle size={12} /> {errors.comment.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-8 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-8 py-4 bg-[#ff5e00] text-white font-bold rounded-2xl shadow-xl shadow-orange-100 hover:bg-[#e05200] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            "Submit Review"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default RatingModal;
