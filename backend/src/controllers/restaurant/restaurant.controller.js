import ROLES from "../../constants/roles.js";
import { Restaurant } from "../../models/Restaurant.model.js";

export const preApprovalRestaurant = async (req, res, next) => {
    try {
        const { restaurantName, restaurantPhone, address, latitude, longitude } = req.body;
        const { restaurantLicense, businessCert, fssaiCert, ownerIdCert } = req.files;
        const currentRestaurant = await Restaurant.findById(req.user._id);
        const getFilePath = (fieldName) => {
            if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
                return req.files[fieldName][0].path;
            }
            return currentRestaurant?.documents?.[fieldName];
        };

        const documents = {
            restaurantLicense: getFilePath('restaurantLicense'),
            businessCert: getFilePath('businessCert'),
            fssaiCert: getFilePath('fssaiCert'),
            ownerIdCert: getFilePath('ownerIdCert'),
        };

        const requiredDocs = ['restaurantLicense', 'businessCert', 'fssaiCert', 'ownerIdCert'];
        const missingDocs = requiredDocs.filter(doc => !documents[doc]);

        if (missingDocs.length > 0) {
            return res.status(400).json({
                message: `Missing required documents: ${missingDocs.join(', ')}`
            });
        }

        if (currentRestaurant.submissionAttempts >= 3) {
            return res.status(403).json({
                message: "Maximum submission attempts (3) reached. Please contact support."
            });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    restaurantName,
                    restaurantPhone,
                    address,
                    location: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    documents,
                    verificationStatus: 'pending'
                },
                $inc: { submissionAttempts: 1 }
            },
            { new: true }
        );
        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Restaurant registered successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getRestaurantProfile = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.user._id);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        return res.status(200).json({ success: true, restaurant });
    } catch (error) {
        next(error);
    }
};

export const updateRestaurantSettings = async (req, res, next) => {
    try {
        const { isTemporaryClosed } = req.body;

        if (typeof isTemporaryClosed !== 'boolean') {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.user._id,
            { $set: { isTemporaryClosed } },
            { new: true }
        );

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        return res.status(200).json({
            success: true,
            message: `Restaurant is now ${isTemporaryClosed ? 'closed' : 'open'} temporarily`,
            isTemporaryClosed: restaurant.isTemporaryClosed
        });
    } catch (error) {
        next(error);
    }
};