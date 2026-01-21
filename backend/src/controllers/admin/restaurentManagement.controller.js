import ROLES from "../../constants/roles.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import redisClient from "../../config/redis.js";
import { env } from "../../config/env.config.js";

export const getAllRestaurants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "newest";
    const status = req.query.status || "all";

    const skip = (page - 1) * limit;

    const listFilter = {
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    if (status !== "all") {
      listFilter.status = status;
    }

    let sortOptions = {};
    if (sortBy === "newest") {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === "a-z") {
      sortOptions = { restaurantName: 1 };
    } else if (sortBy === "z-a") {
      sortOptions = { restaurantName: -1 };
    }
    const [restaurants, totalFilteredCount, totalCount, suspendedCount] =
      await Promise.all([
        Restaurant.find(listFilter, {
          _id: 1,
          fullName: 1,
          restaurantName: 1,
          restaurantPhone: 1,
          email: 1,
          address: 1,
          location: 1,
          documents: 1,
          createdAt: 1,
          isEmailVerified: 1,
          location: 1,
          status: 1,
          verificationStatus: 1,
          isOnboardingCompleted: 1,
        })
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Restaurant.countDocuments(listFilter),
        Restaurant.countDocuments({}),
        Restaurant.countDocuments({ status: "suspended" }),
      ]);

    res.status(200).json({
      status: "success",
      meta: {
        totalCount,
        suspendedCount,
        currentPage: page,
        totalPages: Math.ceil(totalFilteredCount / limit),
        perPage: limit,
      },
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleRestaurantStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const newStatus = restaurant.status === "active" ? "suspended" : "active";
    restaurant.status = newStatus;

    await restaurant.save();

    if (newStatus === "suspended") {
      await redisClient.set(
        `blacklist:${ROLES.RESTAURANT}:${restaurant._id}`,
        "suspended",
        "EX",
        env.REFRESH_TOKEN_MAX_AGE / 1000,
      ); //to convert to seconds
    } else {
      await redisClient.del(`blacklist:${ROLES.RESTAURANT}:${restaurant._id}`);
    }

    res.status(200).json({
      message: `Restaurant status updated to ${newStatus}`,
      user: {
        id: restaurant._id,
        fullName: restaurant.fullName,
        status: restaurant.status,
        verificationStatus: restaurant.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const toggleRestaurantVerificationStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { verificationStatus, reason } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    restaurant.status = verificationStatus;

    await restaurant.save();

    res.status(200).json({
      message: `Restaurant status updated to ${verificationStatus}`,
      user: {
        id: restaurant._id,
        fullName: restaurant.fullName,
        status: restaurant.status,
        verificationStatus: restaurant.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Error toggling verificationStatus:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const RestaurantDetails = (req, res, next) => {
  try {
    const { restaurantId } = req.params.restaurantId;
    const restaurant = Restaurant.findById(restaurantId, {
      _id: 1,
      fullName: 1,
      restaurantName: 1,
      restaurantPhone: 1,
      email: 1,
      address: 1,
      location: 1,
      documents: 1,
      createdAt: 1,
      isEmailVerified: 1,
      location: 1,
      status: 1,
      verificationStatus: 1,
      isOnboardingCompleted: 1,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    res.status(200).json({
      message: `Restaurant details fetched successfully`,
      user: restaurant,
    });
  } catch (error) {
    next(error);
  }
};
