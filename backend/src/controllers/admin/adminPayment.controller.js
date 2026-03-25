import { Booking } from "../../models/Booking.model.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import STATUS_CODES from "../../constants/statusCodes.js";

export const getPaymentDashboard = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const search = (req.query.search || "").trim();
        const dateFilter = req.query.date || "all";
        const statusFilter = req.query.status || "all";
        const skip = (page - 1) * limit;

        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        endOfPreviousMonth.setHours(23, 59, 59, 999);

        // Define the chronological boundaries for period-over-period financial auditing
        let startOfCurrentPeriod = startOfCurrentMonth; 
        let startOfPreviousPeriod = startOfPreviousMonth;
        let endOfPreviousPeriod = endOfPreviousMonth;
        let growthLabel = "vs last month";

        if (dateFilter === "today") {
            startOfCurrentPeriod = new Date(now);
            startOfCurrentPeriod.setHours(0, 0, 0, 0);
            startOfPreviousPeriod = new Date(startOfCurrentPeriod);
            startOfPreviousPeriod.setDate(startOfCurrentPeriod.getDate() - 1);
            endOfPreviousPeriod = new Date(startOfCurrentPeriod);
            endOfPreviousPeriod.setMilliseconds(-1);
            growthLabel = "vs yesterday";
        } else if (dateFilter === "thisWeek") {
            startOfCurrentPeriod = new Date(now);
            startOfCurrentPeriod.setDate(now.getDate() - 7);
            startOfPreviousPeriod = new Date(startOfCurrentPeriod);
            startOfPreviousPeriod.setDate(startOfCurrentPeriod.getDate() - 7);
            endOfPreviousPeriod = new Date(startOfCurrentPeriod);
            endOfPreviousPeriod.setMilliseconds(-1);
            growthLabel = "vs last week";
        } else if (dateFilter === "thisMonth") {
            startOfCurrentPeriod = startOfCurrentMonth;
            startOfPreviousPeriod = startOfPreviousMonth;
            endOfPreviousPeriod = endOfPreviousMonth;
            growthLabel = "vs last month";
        } else if (dateFilter === "thisYear") {
            startOfCurrentPeriod = new Date(now.getFullYear(), 0, 1);
            startOfPreviousPeriod = new Date(now.getFullYear() - 1, 0, 1);
            endOfPreviousPeriod = new Date(now.getFullYear(), 0, 0);
            endOfPreviousPeriod.setHours(23, 59, 59, 999);
            growthLabel = "vs last year";
        }

        let listFilter = {};
        let statsMatch = { status: { $ne: "canceled" } };

        if (statusFilter === "paid") {
            listFilter.status = { $ne: "canceled" };
            statsMatch = { status: { $ne: "canceled" } };
        } else if (statusFilter === "refund") {
            listFilter.status = "canceled";
            statsMatch = { status: "canceled" };
        }

        if (search) {
            const matchedRestaurants = await Restaurant.find({
                restaurantName: { $regex: search, $options: "i" }
            }).select("_id");
            const restaurantIds = matchedRestaurants.map(r => r._id);

            listFilter.$or = [
                { razorpayPaymentId: { $regex: search, $options: "i" } },
                { restaurantId: { $in: restaurantIds } }
            ];
        }

        if (dateFilter === "today") {
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            listFilter.createdAt = { $gte: startOfToday };
        } else if (dateFilter === "thisWeek") {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            listFilter.createdAt = { $gte: startOfWeek };
        } else if (dateFilter === "thisMonth") {
            listFilter.createdAt = { $gte: startOfCurrentMonth };
        } else if (dateFilter === "thisYear") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            listFilter.createdAt = { $gte: startOfYear };
        } else if (dateFilter === "custom" && req.query.startDate && req.query.endDate) {
            const start = new Date(req.query.startDate);
            const end = new Date(req.query.endDate);
            end.setHours(23, 59, 59, 999);
            listFilter.createdAt = { $gte: start, $lte: end };
        }

        // Synchronize the statistics window with the user's active list filter
        if (listFilter.createdAt) {
            statsMatch.createdAt = listFilter.createdAt;
        }

        // Execute a multi-facet aggregation to fetch overall totals and historical comparison data in a single pass
        const stats = await Booking.aggregate([
            { $match: statsMatch },
            {
                $facet: {
                    total: [
                        {
                            $group: {
                                _id: null,
                                commission: { $sum: "$platformFee" },
                                revenue: { $sum: "$totalAmount" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    currentPeriod: [
                        { $match: { createdAt: { $gte: startOfCurrentPeriod } } },
                        {
                            $group: {
                                _id: null,
                                commission: { $sum: "$platformFee" },
                                revenue: { $sum: "$totalAmount" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    previousPeriod: [
                        {
                            $match: {
                                createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                commission: { $sum: "$platformFee" },
                                revenue: { $sum: "$totalAmount" },
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const s = stats[0] || {};
        const total = s.total[0] || { commission: 0, revenue: 0, count: 0 };
        const currentP = s.currentPeriod[0] || { commission: 0, revenue: 0, count: 0 };
        const prevP = s.previousPeriod[0] || { commission: 0, revenue: 0, count: 0 };

        const calculateGrowth = (curr, prev) => {
            if (!prev || prev === 0) return curr > 0 ? 100 : 0;
            return parseFloat(((curr - prev) / prev * 100).toFixed(1));
        };

        const [transactions, totalFilteredCount] = await Promise.all([
            Booking.find(listFilter)
                .populate("restaurantId", "restaurantName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Booking.countDocuments(listFilter)
        ]);

        const data = transactions.map(t => ({
            id: t._id,
            transactionId: t.razorpayPaymentId ? `#${t.razorpayPaymentId.slice(-6).toUpperCase()}` : `#${t._id.toString().slice(-6).toUpperCase()}`,
            date: t.createdAt,
            restaurant: t.restaurantId?.restaurantName || "Archived Restaurant",
            orderTotal: t.totalAmount,
            commissionEarned: t.platformFee,
            paymentStatus: t.status === "canceled" ? "Refund" : "paid"
        }));

        res.status(STATUS_CODES.OK).json({
            success: true,
            stats: {
                commissionEarnings: total.commission,
                monthlyRevenue: total.revenue,
                totalTransactions: total.count,
                commissionGrowth: calculateGrowth(currentP.commission, prevP.commission),
                revenueGrowth: calculateGrowth(currentP.revenue, prevP.revenue),
                transactionGrowth: calculateGrowth(currentP.count, prevP.count),
                growthLabel
            },
            meta: {
                totalCount: totalFilteredCount,
                currentPage: page,
                totalPages: Math.ceil(totalFilteredCount / limit),
                perPage: limit
            },
            data
        });
    } catch (error) {
        next(error);
    }
};

export const getTransactionDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate("restaurantId")
            .populate("userId", "fullName email phone");

        if (!booking) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Transaction not found" });
        }

        res.status(STATUS_CODES.OK).json({
            success: true,
            data: booking
        });
    } catch (error) {
        next(error);
    }
};