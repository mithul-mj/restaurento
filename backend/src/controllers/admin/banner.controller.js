import { Banner } from "../../models/Banner.model.js";
import { ApiError } from "../../utils/errors/ApiError.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages.js";


export const createBanner = async (req, res, next) => {

    try {
        const { targetLink, isActive } = req.body;

        const imageUrl = req.file?.path;
        if (!imageUrl) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, ERROR_MESSAGES.BANNER_REQUIRED)
        }
        const banner = await Banner.create({
            imageUrl,
            targetLink,
            isActive: isActive === "true" || isActive === true,
        })
        res.status(STATUS_CODES.CREATED).json({
            succes: true,
            message: SUCCESS_MESSAGES.BANNER_CREATED,
            data: banner
        })

    } catch (error) {
        next(error)
    }


}
export const getAllBanners = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalBanners = await Banner.countDocuments();
        const totalPages = Math.ceil(totalBanners / limit);

        const banners = await Banner.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: banners,
            pagination: {
                totalBanners,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        next(error);
    }

}

export const toggleBannerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);

        if (!banner) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.BANNER_NOT_FOUND);
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: banner.isActive ? SUCCESS_MESSAGES.BANNER_ACTIVATED : SUCCESS_MESSAGES.BANNER_DEACTIVATED,
            data: banner
        });
    } catch (error) {
        next(error);
    }
}

export const updateBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { targetLink, isActive } = req.body;
        const banner = await Banner.findById(id);

        if (!banner) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.BANNER_NOT_FOUND);
        }

        if (req.file) {
            // TODO: Delete old image from Cloudinary if needed?
            banner.imageUrl = req.file.path;
        }

        if (targetLink !== undefined) banner.targetLink = targetLink;
        if (isActive !== undefined) banner.isActive = isActive === "true" || isActive === true;

        await banner.save();

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.BANNER_UPDATED,
            data: banner
        });
    } catch (error) {
        next(error);
    }
}

export const deleteBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.BANNER_NOT_FOUND);
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.BANNER_DELETED
        });
    } catch (error) {
        next(error);
    }
}