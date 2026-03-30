import { Review } from "../../models/Review.model.js";
import { Booking } from "../../models/Booking.model.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import mongoose from "mongoose";

export const submitReview = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { restaurantId, rating, comment } = req.body;
        const userId = req.user._id;

        // 1. Check if user has a "checked-in" booking for this restaurant
        const hasBooking = await Booking.findOne({ 
            userId, 
            restaurantId, 
            status: "checked-in" 
        });

        if (!hasBooking) {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                success: false,
                message: "You can only review restaurants you've visited (checked-in required)."
            });
        }

        // 2. Find if existing review exists
        let existingReview = await Review.findOne({ userId, restaurantId }).session(session);

        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment;
            await existingReview.save({ session });
        } else {
            existingReview = new Review({
                userId,
                restaurantId,
                rating,
                comment
            });
            await existingReview.save({ session });
        }

        await session.commitTransaction();
        res.status(STATUS_CODES.OK).json({
            success: true,
            message: existingReview.isNew ? "Review submitted successfully" : "Review updated successfully",
            review: existingReview
        });

    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const getExistingReview = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOne({ userId, restaurantId });
        res.status(STATUS_CODES.OK).json({ success: true, review });
    } catch (error) {
        next(error);
    }
}

export const getRestaurantReviews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ restaurantId: id })
            .select("rating comment createdAt userId")
            .populate("userId", "fullName avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Aggregate stats for overview
        const stats = await Review.aggregate([
            { $match: { restaurantId: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            }
        ]);

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalSum = 0;
        let totalCount = 0;

        stats.forEach(item => {
            ratingDistribution[item._id] = item.count;
            totalSum += item._id * item.count;
            totalCount += item.count;
        });

        const averageRating = totalCount > 0 ? parseFloat((totalSum / totalCount).toFixed(1)) : 0;

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: reviews,
            stats: {
                averageRating,
                totalReviews: totalCount,
                ratingDistribution
            },
            pagination: {
                totalReviews: totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: skip + reviews.length < totalCount
            }
        });
    } catch (error) {
        next(error);
    }
};
