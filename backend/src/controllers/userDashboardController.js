import { Banner } from "../models/Banner.model.js"

export const getActiveBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({ success: true, data: banners });
    } catch (error) {
        next(error)
    }
}

