import { Restaurant } from "../../models/Restaurant.model.js";
import { Schedule } from "../../models/Schedule.model.js";
import { Offer } from "../../models/Offer.model.js";
import { Booking } from "../../models/Booking.model.js";
import mongoose from "mongoose";
import STATUS_CODES from "../../constants/statusCodes.js";


export const getUserDashboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = (req.query.search || "").trim();
    const rating = req.query.rating || 'Any';
    const cost = req.query.cost || req.query['cost[]'] || [];
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    let sort = req.query.sort;
    if (!sort) {
      if (!isNaN(lat) && !isNaN(lng)) {
        sort = 'distance';
      } else {
        sort = 'rating_high_low';
      }
    }


    const baseQuery = {
      verificationStatus: "approved",
      isOnboardingCompleted: true,
      status: "active",
    };

    const pipeline = [];

    if (!isNaN(lat) && !isNaN(lng)) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceFromUser",
          maxDistance: 15000, // 15km radius
          spherical: true,
          query: baseQuery
        }
      });
    } else {
      pipeline.push({ $match: baseQuery });
    }

    // Get the active schedule to handle filtering/sorting
    const lookupScheduleStage = [
      {
        $lookup: {
          from: "schedules",
          let: { rid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$restaurantId", "$$rid"] },
                validFrom: { $lte: new Date() }
              }
            },
            { $sort: { validFrom: -1 } },
            { $limit: 1 }
          ],
          as: "schedule"
        }
      },
      { $unwind: "$schedule" },
      {
        $addFields: {
          slotPrice: "$schedule.slotPrice",
          openingHours: "$schedule.openingHours",
          slotConfig: "$schedule.slotConfig"
        }
      }
    ];

    pipeline.push(...lookupScheduleStage);

    // Get the best active offer for each restaurant
    const lookupOfferStage = [
      {
        $lookup: {
          from: "offers",
          let: { rid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$restaurantId", "$$rid"] },
                isActive: true,
                validFrom: { $lte: new Date() },
                $or: [
                  { validUntil: { $exists: false } },
                  { validUntil: null },
                  { validUntil: { $gt: new Date() } }
                ]
              }
            },
            { $sort: { discountValue: -1 } },
            { $limit: 1 }
          ],
          as: "bestOffer"
        }
      },
      {
        $addFields: {
          bestOffer: { $arrayElemAt: ["$bestOffer", 0] }
        }
      }
    ];

    pipeline.push(...lookupOfferStage);

    // Filter by Search, Rating, and Cost
    const matchConditions = [];
    if (search) {
      matchConditions.push({
        $or: [
          { restaurantName: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ]
      });
    }

    if (rating === '3.5+') matchConditions.push({ 'ratingStats.average': { $gte: 3.5 } });
    else if (rating === '4.0+') matchConditions.push({ 'ratingStats.average': { $gte: 4.0 } });
    else if (rating === '4.5+') matchConditions.push({ 'ratingStats.average': { $gte: 4.5 } });

    let costFilters = [];
    if (cost) {
      if (typeof cost === 'string') costFilters = cost.split(',').map(c => c.trim());
      else if (Array.isArray(cost)) costFilters = cost.map(c => c.trim());
    }
    const priceConditions = [];
    for (const c of costFilters) {
      if (c === '100-200') priceConditions.push({ slotPrice: { $gte: 100, $lte: 200 } });
      else if (c === '200-300') priceConditions.push({ slotPrice: { $gte: 200, $lte: 300 } });
      else if (c === '300-400') priceConditions.push({ slotPrice: { $gte: 300, $lte: 400 } });
      else if (c === '400-500') priceConditions.push({ slotPrice: { $gte: 400, $lte: 500 } });
      else if (c === '500+') priceConditions.push({ slotPrice: { $gte: 500 } });
    }
    if (priceConditions.length > 0) matchConditions.push({ $or: priceConditions });

    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    // Sorting
    let sortOptions = {};
    if (sort === 'rating_high_low') sortOptions = { 'ratingStats.average': -1 };
    else if (sort === 'cost_low_high') sortOptions = { slotPrice: 1 };
    else if (sort === 'cost_high_low') sortOptions = { slotPrice: -1 };
    else if (sort === 'distance' && !isNaN(lat) && !isNaN(lng)) sortOptions = { distanceFromUser: 1 };

    if (Object.keys(sortOptions).length > 0) {
      pipeline.push({ $sort: sortOptions });
    }

    const skip = (page - 1) * limit;

    const projectStage = {
      $project: {
        _id: 1,
        restaurantName: 1,
        address: 1,
        location: 1,
        images: { $slice: ["$images", 1] },
        ratingStats: 1,
        tags: 1,
        slotPrice: 1,
        isCurrentlyOpen: 1,
        distanceFromUser: 1,
        bestOffer: 1,
      }
    };

    const now = new Date();
    const day = now.getDay();
    const currentDayIndex = day === 0 ? 6 : day - 1;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const addFieldsStage = {
      $addFields: {
        todaySchedule: { $arrayElemAt: ["$openingHours.days", currentDayIndex] }
      }
    };

    const calculateOpenStage = {
      $addFields: {
        isCurrentlyOpen: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$isTemporaryClosed", false] },
                { $eq: ["$todaySchedule.isClosed", false] },
                { $gte: [currentMinutes, "$todaySchedule.startTime"] },
                { $lte: [currentMinutes, "$todaySchedule.endTime"] }
              ]
            },
            then: true,
            else: false
          }
        }
      }
    };

    pipeline.push({
      $facet: {
        metadata: [
          ...(req.query.openNow === 'true'
            ? [addFieldsStage, calculateOpenStage, { $match: { isCurrentlyOpen: true } }]
            : []),
          { $count: "total" }
        ],
        data: [
          addFieldsStage,
          calculateOpenStage,
          ...(req.query.openNow === 'true' ? [{ $match: { isCurrentlyOpen: true } }] : []),
          projectStage,
          { $skip: skip },
          { $limit: limit }
        ]
      }
    });

    const result = await Restaurant.aggregate(pipeline);

    const restaurants = result[0].data;

    const totalRestaurants = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const totalPages = Math.ceil(totalRestaurants / limit);

    res.status(STATUS_CODES.OK).json({
      success: true,
      restaurants,
      pagination: {
        currentPage: page,
        totalPages,
        totalRestaurants,
        hasNextPage: page < totalPages,
      },
      appliedFilters: {
        search, sort, rating, cost: costFilters,
        hasLocation: (!isNaN(lat) && !isNaN(lng))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Invalid Restaurant ID" });
    }

    // Get restaurant info, current schedule, and all active offers in parallel
    const [restaurant, activeSchedule, availableOffers] = await Promise.all([
      Restaurant.findOne({ _id: id, status: "active" })
        .select("-documents -onboardingStep -submissionAttempts -verificationStatus -isOnboardingCompleted -ownerId -menuItems -__v")
        .lean(),
      Schedule.findOne({
        restaurantId: id,
        validFrom: { $lte: new Date() }
      })
        .sort({ validFrom: -1 })
        .lean(),
      Offer.find({
        restaurantId: new mongoose.Types.ObjectId(id),
        isActive: true,
        validFrom: { $lte: new Date() },
        $or: [
          { validUntil: { $exists: false } },
          { validUntil: null },
          { validUntil: { $gt: new Date() } }
        ]
      }).sort({ discountValue: -1 }).lean()
    ]);

    if (!restaurant) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: "Restaurant not found" });
    }

    if (!activeSchedule) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: "Restaurant schedule not found" });
    }

    // 2. Prepare for "Currently Open" calculation
    const now = new Date();
    const day = now.getDay();
    const currentDayIndex = day === 0 ? 6 : day - 1;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todaySchedule = activeSchedule.openingHours.days[currentDayIndex];

    // Logic to check if open for business right now
    const isCurrentlyOpen = !restaurant.isTemporaryClosed &&
      !todaySchedule.isClosed &&
      currentMinutes >= todaySchedule.startTime &&
      currentMinutes <= todaySchedule.endTime;

    // Combine everything for the frontend
    const finalRestaurantData = {
      ...restaurant,
      openingHours: activeSchedule.openingHours,
      slotConfig: activeSchedule.slotConfig,
      totalSeats: activeSchedule.totalSeats,
      slotPrice: activeSchedule.slotPrice,
      isCurrentlyOpen: isCurrentlyOpen,
      offers: availableOffers || []
    };

    res.status(STATUS_CODES.OK).json({ success: true, restaurant: finalRestaurantData });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || "All";
    const search = req.query.search || "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Invalid Restaurant ID" });
    }

    const matchStage = { $match: { _id: new mongoose.Types.ObjectId(id), status: "active" } };
    const unwindStage = { $unwind: "$menuItems" };

    const filterStage = { $match: {} };

    if (category !== "All") {
      filterStage.$match["menuItems.categories"] = category;
    }

    if (search) {
      filterStage.$match["menuItems.name"] = { $regex: search, $options: "i" };
    }

    const pipeline = [
      matchStage,
      unwindStage,
      filterStage,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $replaceRoot: { newRoot: "$menuItems" } }
          ]
        }
      }
    ];

    const result = await Restaurant.aggregate(pipeline);

    const menuItems = result[0].data;
    const totalItems = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const totalPages = Math.ceil(totalItems / limit);

    res.status(STATUS_CODES.OK).json({
      success: true,
      menu: menuItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getTopRestaurants = async (req, res, next) => {
  try {
    const topBooked = await Booking.aggregate([
      { $match: { status: { $in: ["approved", "checked-in"] } } },
      { $group: { _id: "$restaurantId", bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);

    let restaurantIds = topBooked.map(b => b._id);

    if (restaurantIds.length < 5) {
      const extra = await Restaurant.find({ 
        _id: { $nin: restaurantIds },
        status: "active",
        verificationStatus: "approved",
        isOnboardingCompleted: true
      })
      .sort({ "ratingStats.average": -1 })
      .limit(5 - restaurantIds.length)
      .select("_id");
      
      restaurantIds = [...restaurantIds, ...extra.map(r => r._id)];
    }

    const pipeline = [
      { $match: { _id: { $in: restaurantIds } } },
      {
        $lookup: {
          from: "schedules",
          let: { rid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$restaurantId", "$$rid"] }, validFrom: { $lte: new Date() } } },
            { $sort: { validFrom: -1 } },
            { $limit: 1 }
          ],
          as: "schedule"
        }
      },
      { $unwind: { path: "$schedule", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "offers",
          let: { rid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$restaurantId", "$$rid"] },
                isActive: true,
                validFrom: { $lte: new Date() },
                $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gt: new Date() } }]
              }
            },
            { $sort: { discountValue: -1 } },
            { $limit: 1 }
          ],
          as: "bestOffer"
        }
      },
      { $addFields: { bestOffer: { $arrayElemAt: ["$bestOffer", 0] } } },
      {
        $project: {
          _id: 1,
          restaurantName: 1,
          address: 1,
          location: 1,
          images: { $slice: ["$images", 1] },
          ratingStats: 1,
          tags: 1,
          slotPrice: "$schedule.slotPrice",
          bestOffer: 1,
        }
      }
    ];

    const restaurants = await Restaurant.aggregate(pipeline);

    res.status(STATUS_CODES.OK).json({ success: true, restaurants });
  } catch (error) {
    next(error);
  }
};
