import { Banner } from "../models/Banner.model.js"
import STATUS_CODES from "../constants/statusCodes.js";


export const getActiveBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
        res.status(STATUS_CODES.OK).json({ success: true, data: banners });
    } catch (error) {
        next(error)
    }
}

