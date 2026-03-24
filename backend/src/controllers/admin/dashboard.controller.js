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
        } else if (timeframe === "month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        } else if (timeframe === "year") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateFilter = { createdAt: { $gte: startOfYear } };
        }

        // Gather platform-wide baseline metrics
        const totalRestaurants = await Restaurant.countDocuments();
        const pendingApprovals = await Restaurant.countDocuments({ verificationStatus: "pending" });
        const totalUsers = await User.countDocuments();

        // Calculate lifetime platform commissions
        const earningsResult = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$platformFee" }
                }
            }
        ]);
        const totalEarnings = earningsResult[0]?.totalEarnings || 0;

        // Rank the top 5 busy restaurants within the chosen timeframe
        const topRestaurants = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$restaurantId",
                    bookingCount: { $sum: 1 }
                }
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 5 },
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

        // Build a continuous 6-month historical window for growth tracking
        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthsData.push({
                month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d),
                year: d.getFullYear(),
                total: 0
            });
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1); 

        const actualGrowth = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    total: { $sum: "$platformFee" }
                }
            }
        ]);

        // Merge real database results into our month-by-month timeline
        const monthlyGrowth = monthsData.map(m => {
            const match = actualGrowth.find(ag => {
                const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return monthNames[ag._id.month] === m.month && ag._id.year === m.year;
            });
            return match ? { ...m, total: match.total } : m;
        });

        const stats = [
            { label: "Total Restaurants", value: totalRestaurants.toLocaleString(), badge: null },
            { label: "Pending Approvals", value: pendingApprovals.toLocaleString(), badge: pendingApprovals > 0 ? pendingApprovals.toString() : null },
            { label: "Total Earnings", value: `₹${totalEarnings.toLocaleString()}`, badge: null },
        ];

        return res.status(STATUS_CODES.OK).json({
            success: true,
            message: "Dashboard stats fetched successfully",
            data: {
                stats,
                trends: topRestaurants,
                growth: monthlyGrowth,
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Fetch Error:", error);
        next(error);
    }
};
