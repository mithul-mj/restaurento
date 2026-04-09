import { Offer } from "../../models/Offer.model.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { Booking } from "../../models/Booking.model.js";
import mongoose from "mongoose";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages.js";

export const createOffer = async (req, res, next) => {
  try {
    const { discountValue, minOrderValue, validFrom, validUntil } = req.body;
    const restaurantId = req.user._id;

    const offer = await Offer.create({
      restaurantId,
      discountValue,
      minOrderValue,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.OFFER_CREATED,
      data: offer,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getMyOffers = async (req, res, next) => {
  try {
    const restaurantId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, sortBy, search } = req.query;

    const match = { restaurantId: new mongoose.Types.ObjectId(restaurantId) };

    // Filter by Status
    if (status === "Active") match.isActive = true;
    else if (status === "Paused") match.isActive = false;

    // Search logic (Search by offer value)
    if (search) {
      const searchValue = parseFloat(search);
      if (!isNaN(searchValue)) {
        match.$or = [
          { discountValue: searchValue },
          { minOrderValue: searchValue },
        ];
      }
    }

    let sort = { createdAt: -1 };
    if (sortBy === "Oldest") sort = { createdAt: 1 };
    else if (sortBy === "Newest") sort = { createdAt: -1 };

    // Join with Booking collection to find actual usage per offer
    const offers = await Offer.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "appliedOffer.offerId",
          as: "claims",
        },
      },
      {
        $addFields: {
          usedCount: { $size: "$claims" },
        },
      },
      { $project: { claims: 0 } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await Offer.countDocuments(match);

    // Calculate Global Stats for the restaurant
    const totalActive = await Offer.countDocuments({
      restaurantId,
      isActive: true,
      $or: [
        { validUntil: { $exists: false } },
        { validUntil: null },
        { validUntil: { $gte: new Date().setHours(0, 0, 0, 0) } },
      ],
    });

    // Calculate Global Stats: Total claims across all offers
    const stats = await Booking.countDocuments({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      "appliedOffer.offerId": { $exists: true },
    });
    const totalClaims = stats;

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: offers,
      stats: {
        activeCampaigns: totalActive,
        totalClaims: totalClaims,
      },
      meta: {
        totalCount: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        perPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user._id;
    const updates = { ...req.body };

    const offer = await Offer.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!offer) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.OFFER_NOT_FOUND });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.OFFER_UPDATED,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleOfferStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user._id;

    const offer = await Offer.findOne({ _id: id, restaurantId });
    if (!offer) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.OFFER_NOT_FOUND });
    }

    // Check if offer is expired
    if (
      offer.validUntil &&
      new Date(offer.validUntil).setHours(0, 0, 0, 0) <
        new Date().setHours(0, 0, 0, 0)
    ) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.EXPIRED_OFFER,
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: offer.isActive ? SUCCESS_MESSAGES.ACTIVATED("Offer") : SUCCESS_MESSAGES.DEACTIVATED("Offer"),
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user._id;

    const offer = await Offer.findOneAndDelete({ _id: id, restaurantId });
    if (!offer) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.OFFER_NOT_FOUND });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.OFFER_DELETED,
    });
  } catch (error) {
    next(error);
  }
};
