import mongoose from 'mongoose';
import { Wishlist } from '../../models/Wishlist.model.js'


export const addToWishlist = async (req, res, next) => {


    try {
        const { restaurantId, items, mealType } = req.body;
        const userId = req.user?._id;

        const newWishlist = await Wishlist.create({
            userId,
            restaurantId,
            items,
            mealType
        });
        res.status(201).json({
            success: true,
            message: "Saved to wishlist",
            wishlist: newWishlist,
        })

    } catch (error) {
        next(error)
    }

}

export const getWishlists = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const wishlists = await Wishlist.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurantId",
                    foreignField: "_id",
                    as: "restaurantInfo"
                }

            }
            , { $unwind: "$restaurantInfo" },
            {
                $project: {
                    _id: 1,
                    restaurantId: 1,
                    restaurantName: "$restaurantInfo.restaurantName",
                    restaurantAddress: "$restaurantInfo.address",
                    restaurantImage: { $arrayElemAt: ["$restaurantInfo.images", 0] },
                    ratingStats: "$restaurantInfo.ratingStats",
                    mealType: 1,
                    createdAt: 1,

                    items: {
                        $map: {
                            input: "$items",
                            as: "item",
                            in: {
                                dishId: "$$item.dishId",
                                qty: "$$item.qty",
                                dishDetails: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$restaurantInfo.menuItems",
                                                as: "menuSrc",
                                                cond: { $eq: ["$$menuSrc._id", "$$item.dishId"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ])

        const totalItems = await Wishlist.countDocuments({ userId });

        res.status(200).json({
            success: true,
            wishlists: wishlists,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                hasNextPage: page * limit < totalItems,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        next(error);
    }
}

export const removeFromWishlist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const deleted = await Wishlist.findOneAndDelete({ _id: id, userId });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Wishlist item not found" });
        }

        res.status(200).json({
            success: true,
            message: "Removed from wishlist"
        });
    } catch (error) {
        next(error);
    }
}