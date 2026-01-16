import ROLES from "../../constants/roles.js";
import { Restaurant } from "../../models/Restaurant.model.js";

export const preApprovalRestaurant = async (req, res, next) => {
    try {
        const { restaurantName, address, latitude, longitude } = req.body;
        const { restaurantLicense, businessCert, fssaiCert, ownerIdCert } = req.files;
        // Check for existing documents to preserve them if not re-uploaded
        const currentRestaurant = await Restaurant.findById(req.user._id);
        const getFilePath = (fieldName) => {
            if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
                return req.files[fieldName][0].path;
            }
            return currentRestaurant?.documents?.[fieldName];
        };

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.user._id,
            {
                restaurantName: restaurantName,
                address,
                location: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)]
                },
                documents: {
                    restaurantLicense: getFilePath('restaurantLicense'),
                    businessCert: getFilePath('businessCert'),
                    fssaiCert: getFilePath('fssaiCert'),
                    ownerIdCert: getFilePath('ownerIdCert'),
                },
                status: 'pending'
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