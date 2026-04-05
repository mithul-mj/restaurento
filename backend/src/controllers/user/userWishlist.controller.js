import mongoose from 'mongoose';
import { Wishlist } from '../../models/Wishlist.model.js'
import STATUS_CODES from '../../constants/statusCodes.js';



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
        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: "Saved to wishlist",
            wishlist: newWishlist,
        })

    } catch (error) {
        next(error)
    }

}
// We'll pull up all the restaurants and dishes this user has saved for later.
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
            },
            { $unwind: "$restaurantInfo" },
            {
                $lookup: {
                    from: "schedules",
                    let: { rid: "$restaurantId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$restaurantId", "$$rid"] }, validFrom: { $lte: new Date() } } },
                        { $sort: { validFrom: -1 } },
                        { $limit: 1 }
                    ],
                    as: "scheduleInfo"
                }
            },
            { $unwind: { path: "$scheduleInfo", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    restaurantId: 1,
                    closedTill: "$scheduleInfo.closedTill",
                    restaurantName: "$restaurantInfo.restaurantName",
                    restaurantAddress: "$restaurantInfo.address",
                    restaurantImage: { $arrayElemAt: ["$restaurantInfo.images", 0] },
                    ratingStats: "$restaurantInfo.ratingStats",
                    mealType: 1,
                    createdAt: 1,
                    // Now for the most important part: we'll sync each saved dish with 
                    // the restaurant's live menu to check if anything was sold out or deleted.

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
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$restaurantInfo.menuItems",
                                                        as: "menuSrc",
                                                        cond: { $eq: ["$$menuSrc._id", "$$item.dishId"] }
                                                    }
                                                },
                                                as: "filteredDish",
                                                in: {
                                                    _id: "$$filteredDish._id",
                                                    name: "$$filteredDish.name",
                                                    price: "$$filteredDish.price",
                                                    image: "$$filteredDish.image",
                                                    categories: "$$filteredDish.categories",
                                                    isAvailable: "$$filteredDish.isAvailable",
                                                    isDeleted: { $ifNull: ["$$filteredDish.isDeleted", false] }
                                                }
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

        res.status(STATUS_CODES.OK).json({
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
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: "Wishlist item not found" });
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: "Removed from wishlist"
        });
    } catch (error) {
        next(error);
    }
}