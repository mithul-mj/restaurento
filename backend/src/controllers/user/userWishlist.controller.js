import { Wishlist } from '../../models/Wishlist.model.js'


export const addToWishlist = async (req, res, next) => {


    try {
        const { restaurantId, items } = req.body;
        const userId = req.user?._id;

        const newWishlist = await Wishlist.create({
            userId,
            restaurantId,
            items
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