import { email } from "zod";
import { User } from "../../models/User.model.js";
import redisClient from "../../config/redis.js";
import { env } from "../../config/env.config.js";
import ROLES from "../../constants/roles.js";
import STATUS_CODES from "../../constants/statusCodes.js";


export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = (req.query.search || "").trim();
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
      sortOptions = { fullName: 1 };
    } else if (sortBy === "z-a") {
      sortOptions = { fullName: -1 };
    }

    const [users, totalFilteredCount, totalCount, suspendedCount] =
      await Promise.all([
        User.find(listFilter, {
          _id: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
          status: 1,
          createdAt: 1,
          isEmailVerified: 1,
          location: 1,
        })
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(listFilter),
        User.countDocuments({}),
        User.countDocuments({ status: "suspended" }),
      ]);

    res.status(STATUS_CODES.OK).json({
      status: "success",
      meta: {
        totalCount,
        suspendedCount,
        currentPage: page,
        totalPages: Math.ceil(totalFilteredCount / limit),
        perPage: limit,
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "User not found." });
    }

    const newStatus = user.status === "active" ? "suspended" : "active";
    user.status = newStatus;

    await user.save();

    if (newStatus === "suspended") {
      await redisClient.set(`blacklist:${ROLES.USER}:${user._id}`, 'suspended', 'EX', env.REFRESH_TOKEN_MAX_AGE / 1000); //to convert to seconds
    } else {
      await redisClient.del(`blacklist:${ROLES.USER}:${user._id}`);
    }


    res.status(STATUS_CODES.OK).json({
      message: `User status updated to ${newStatus}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
  }
};
