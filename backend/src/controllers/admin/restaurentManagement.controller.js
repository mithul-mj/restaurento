import ROLES from "../../constants/roles.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import redisClient from "../../config/redis.js";
import { env } from "../../config/env.config.js";
import { sendEmail } from "../../services/commonAuth.service.js";
import { getVerificationStatusEmailTemplate } from "../../utils/emailTemplates.js";

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

    // Fix: Update verificationStatus, not status
    restaurant.verificationStatus = verificationStatus;


    // Add to history
    restaurant.verificationHistory.push({
      status: verificationStatus,
      reason: reason || "",
      date: new Date(),
    });

    await restaurant.save();

    // Send email notification
    try {
      if (
        verificationStatus === "approved" ||
        verificationStatus === "rejected"
      ) {
        const recipientName = restaurant.fullName || "Restaurant Partner";
        const subject =
          verificationStatus === "approved"
            ? "Restaurento - Application Approved! 🎉"
            : "Restaurento - Application Status Update";

        const html = getVerificationStatusEmailTemplate(
          recipientName,
          verificationStatus,
          reason,
        );

        await sendEmail(
          restaurant.email,
          subject,
          `Your application has been ${verificationStatus}.`,
          html,
        );
      }
    } catch (emailError) {
      console.error("Failed to send verification status email:", emailError);
      // Continue execution
    }

    res.status(200).json({
      message: `Restaurant status updated to ${verificationStatus}`,
      user: {
        id: restaurant._id,
        fullName: restaurant.fullName,
        status: restaurant.status,
        verificationStatus: restaurant.verificationStatus,
        verificationHistory: restaurant.verificationHistory,
      },
    });
  } catch (error) {
    console.error("Error toggling verificationStatus:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const RestaurantDetails = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId, {
      _id: 1,
      fullName: 1,
      restaurantName: 1,
      restaurantPhone: 1,
      phone: 1,
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
      description: 1,
      tags: 1,
      openingHours: 1,
      slotConfig: 1,
      totalSeats: 1,
      images: 1,
      menuItems: 1,
      slotPrice: 1,
      verificationHistory: 1,
      submissionAttempts: 1,
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
