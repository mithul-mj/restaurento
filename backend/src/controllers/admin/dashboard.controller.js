import { Booking } from "../../models/Booking.model.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { User } from "../../models/User.model.js";
import STATUS_CODES from "../../constants/statusCodes.js";

export const getDashboardStats = async (req, res, next) => {
    try {
        const { timeframe = "month" } = req.query;

        // Establish the search window based on the user's selected timeframe
        const now = new Date();
        let dateFilter = {};

        if (timeframe === "day") {
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfDay } };
        } else if (timeframe === "week") {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfWeek } };
        } else if (timeframe === "month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        } else if (timeframe === "year") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateFilter = { createdAt: { $gte: startOfYear } };
        }

        // Compute platform-wide growth metrics for the currently tracked window
        const newRestaurants = await Restaurant.countDocuments(dateFilter);
        const pendingApprovals = await Restaurant.countDocuments({ verificationStatus: "pending", ...dateFilter });
        const newUsers = await User.countDocuments(dateFilter);

        // Calculate platform commission and metrics (Excluding canceled bookings)
        const bookingFilter = { ...dateFilter, status: { $ne: "canceled" } };

        const bookingMetrics = await Booking.aggregate([
            { $match: bookingFilter },
            {
                $group: {
                    _id: null,
                    totalCommission: { $sum: "$platformFee" },
                    totalCount: { $sum: 1 }
                }
            }
        ]);

        // Summate platform commission and order volume while strictly excluding canceled records for data integrity
        const totalCommission = bookingMetrics[0]?.totalCommission || 0;
        const totalBookings = bookingMetrics[0]?.totalCount || 0;

        // Rank the top 5 busy restaurants within the chosen timeframe
        const topRestaurants = await Booking.aggregate([
            { $match: bookingFilter },
            {
                $group: {
                    _id: "$restaurantId",
                    bookingCount: { $sum: 1 }
                }
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "_id",
                    foreignField: "_id",
                    as: "restaurantInfo"
                }
            },
            { $unwind: "$restaurantInfo" },
            {
                $project: {
                    _id: 0,
                    name: "$restaurantInfo.restaurantName",
                    value: "$bookingCount",
                    width: { $concat: [{ $toString: { $min: [100, { $multiply: ["$bookingCount", 10] }] } }, "%"] }
                }
            }
        ]);

        // Build dynamic timeline for Growth Analytics (Aligned with dateFilter)
        const growthWindow = [];
        let groupFormat, matchDate;

        if (timeframe === "year") {
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                growthWindow.push({
                    label: d.toLocaleString('en-US', { month: 'short' }),
                    year: d.getFullYear(),
                    month: d.getMonth() + 1,
                    users: 0,
                    restaurants: 0,
                    commissions: 0
                });
            }
            groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
            matchDate = new Date();
            matchDate.setMonth(0, 1); // Start of Current Year
            matchDate.setHours(0, 0, 0, 0);
        } else {
            // Calculate days for current Week or Month
            const startDate = new Date(now);
            if (timeframe === "week") {
                const day = startDate.getDay();
                const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
                startDate.setDate(diff);
            } else {
                startDate.setDate(1); // Start of Month
            }
            startDate.setHours(0, 0, 0, 0);
            matchDate = startDate;

            // Generate points from startDate to Today
            const temp = new Date(startDate);
            while (temp <= now) {
                growthWindow.push({
                    label: temp.getDate().toString(),
                    year: temp.getFullYear(),
                    month: temp.getMonth() + 1,
                    day: temp.getDate(),
                    users: 0,
                    restaurants: 0,
                    commissions: 0
                });
                temp.setDate(temp.getDate() + 1);
            }

            groupFormat = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
            };
        }

        const dateMatch = { createdAt: { $gte: matchDate } };

        // Aggregations
        const userGrowth = await User.aggregate([
            { $match: dateMatch },
            { $group: { _id: groupFormat, count: { $sum: 1 } } }
        ]);

        const restaurantGrowth = await Restaurant.aggregate([
            { $match: dateMatch },
            { $group: { _id: groupFormat, count: { $sum: 1 } } }
        ]);

        const growthBookingFilter = { ...dateMatch, status: { $ne: "canceled" } };
        const commissionGrowth = await Booking.aggregate([
            { $match: growthBookingFilter },
            { $group: { _id: groupFormat, total: { $sum: "$platformFee" } } }
        ]);

        const refinedGrowth = growthWindow.map(m => {
            const findMatch = (arr) => arr.find(item =>
                item._id.year === m.year &&
                item._id.month === m.month &&
                (timeframe === "year" || item._id.day === m.day)
            );

            const userMatch = findMatch(userGrowth);
            const restMatch = findMatch(restaurantGrowth);
            const commMatch = findMatch(commissionGrowth);

            return {
                label: m.label,
                users: userMatch ? userMatch.count : 0,
                restaurants: restMatch ? restMatch.count : 0,
                commissions: commMatch ? commMatch.total : 0
            };
        });

        const stats = [
            { label: "Platform Commission", value: `₹${totalCommission.toLocaleString()}`, color: "text-green-600" },
            { label: "Total Bookings", value: totalBookings.toLocaleString() },
            { label: "New Restaurants", value: newRestaurants.toLocaleString() },
            { label: "New Users", value: newUsers.toLocaleString() },
            { label: "Pending Approvals", value: pendingApprovals.toLocaleString(), badge: pendingApprovals > 0 ? pendingApprovals.toString() : null },
        ];

        return res.status(STATUS_CODES.OK).json({
            success: true,
            data: {
                stats,
                trends: topRestaurants,
                growth: refinedGrowth,
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Fetch Error:", error);
        next(error);
    }
};
