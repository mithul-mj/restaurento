import { Restaurant } from "../../models/Restaurant.model.js";

export const getUserDashboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";
    const sort = req.query.sort || 'rating_high_low';
    const rating = req.query.rating || 'Any';
    const cost = req.query.cost || req.query['cost[]'] || [];
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);


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
          maxDistance: 15000, // 10km radius
          spherical: true,
          query: baseQuery
        }
      });
    } else {
      pipeline.push({ $match: baseQuery });
    }

    // (Search, Rating, Cost)
    const matchConditions = [];

    if (search) {
      matchConditions.push({
        $or: [
          { restaurantName: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ]
      });
    }

    // Rating
    if (rating === '3.5+') matchConditions.push({ 'ratingStats.average': { $gte: 3.5 } });
    else if (rating === '4.0+') matchConditions.push({ 'ratingStats.average': { $gte: 4.0 } });
    else if (rating === '4.5+') matchConditions.push({ 'ratingStats.average': { $gte: 4.5 } });

    // Cost
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
    if (priceConditions.length > 0) {
      matchConditions.push({ $or: priceConditions });
    }

    // Apply all
    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    // 3. Sorting
    let sortOptions = {};
    if (sort === 'rating_high_low') sortOptions = { 'ratingStats.average': -1 };
    else if (sort === 'cost_low_high') sortOptions = { slotPrice: 1 };
    else if (sort === 'cost_high_low') sortOptions = { slotPrice: -1 };
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
        images: 1,
        ratingStats: 1,
        tags: 1,
        slotPrice: 1,
        isCurrentlyOpen: 1,
        distanceFromUser: 1,
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
        metadata: [{ $count: "total" }],
        data: [
          addFieldsStage,
          calculateOpenStage,
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

    res.status(200).json({
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
