import { Banner } from "../../models/Banner.model.js";
import { ApiError } from "../../utils/errors/ApiError.js";

export const createBanner = async (req, res, next) => {

    try {
        const { targetLink, isActive } = req.body;

        const imageUrl = req.file?.path;
        if (!imageUrl) {
            throw new ApiError(400, "Banner image is required")
        }
        const banner = await Banner.create({
            imageUrl,
            targetLink,
            isActive: isActive === "true" || isActive === true,
        })
        res.status(201).json({
            succes: true,
            message: "Banner created successfully",
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

        res.status(200).json({
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
            throw new ApiError(404, "Banner not found");
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.status(200).json({
            success: true,
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
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
            throw new ApiError(404, "Banner not found");
        }

        if (req.file) {
            // TODO: Delete old image from Cloudinary if needed?
            banner.imageUrl = req.file.path;
        }

        if (targetLink !== undefined) banner.targetLink = targetLink;
        if (isActive !== undefined) banner.isActive = isActive === "true" || isActive === true;

        await banner.save();

        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
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
            throw new ApiError(404, "Banner not found");
        }

        res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}