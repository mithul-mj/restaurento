import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import authService from '../../services/auth.service';
import { showConfirm, showToast } from '../../utils/alert';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import PageLoader from '../../components/PageLoader';
import { useState } from 'react';
const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [timeframe, setTimeframe] = useState("month");
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const { data: dashboardData, isLoading } = useAdminDashboard(timeframe);

    const handleLogout = async () => {
        const result = await showConfirm(
            "Logout",
            "Are you sure you want to logout?",
            "Yes, Logout"
        );
        if (result.isConfirmed) {
            try {
                await authService.logout("ADMIN");
                showToast("Logged out successfully", "success");
            } catch (error) {
                console.error("Logout failed", error);
            } finally {
                dispatch(logout());
                navigate("/admin/login");
            }
        }
    };

    if (isLoading) return <PageLoader />;

    const { stats = [], trends = [], growth = [] } = dashboardData?.data || {};

    // Setup chart dimensions and scale
    const chartWidth = 440;
    const chartHeight = 150;
    const maxVal = Math.max(...growth.map(g => g.total), 1);
    
    // Map data points to SVG coordinates for the line chart
    const points = growth.map((g, i) => ({
        x: (i / 5) * chartWidth,
        y: chartHeight - ((g.total / (maxVal * 1.5)) * chartHeight) - 20,
        month: g.month,
        total: g.total
    }));

    // Build a smooth cubic bezier path through the data points
    let pathAcc = "";
    points.forEach((p, i) => {
        if (i === 0) pathAcc += `M${p.x},${p.y}`;
        else {
            const cpX = (points[i-1].x + p.x) / 2;
            pathAcc += ` C${cpX},${points[i-1].y} ${cpX},${p.y} ${p.x},${p.y}`;
        }
    });

    const revenuePath = pathAcc || "M0,100 L440,100";
    const revenueFillPath = `${revenuePath} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;

    const lastEarningsMonth = growth[growth.length - 1]?.total || 0;
    const timeframeLabel = timeframe === "day" ? "today" : timeframe === "month" ? "this month" : "this year";

    return (
        <>
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Admin Dashboard</h1>
                <p className="text-gray-500 font-medium md:text-lg opacity-80 italic">Overview of your platform operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                            {stat.label}
                            {stat.badge && (
                                <span className="bg-[#ff5e00] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{stat.badge}</span>
                            )}
                        </p>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Booking Trends</h3>
                            <p className="text-gray-400 text-xs font-medium">Top performing restaurants {timeframeLabel}</p>
                        </div>
                        <div className="flex bg-gray-50 rounded-lg p-1 text-xs font-medium">
                            {["day", "month", "year"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTimeframe(t)}
                                    className={`px-3 py-1 rounded-md transition-all ${timeframe === t ? "bg-white text-[#ff5e00] shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {trends.length > 0 ? trends.map((item, i) => (
                            <div key={i} className="group">
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-1.5">
                                    <span className="w-32 text-right shrink-0 truncate">{item.name}</span>
                                    <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#ff5e00] rounded-full transition-all duration-500"
                                            style={{ width: item.width }}
                                        ></div>
                                    </div>
                                    <span className="w-8 font-bold text-gray-900">{item.value}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-gray-400 font-medium italic">No booking data found for this period</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="mb-6">
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Financial Growth</h3>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-3xl md:text-4xl font-bold text-[#ff5e00] tracking-tight">₹{lastEarningsMonth.toLocaleString()}</span>
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Growth this Month</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-48 w-full mt-8">
                        <svg 
                            viewBox="0 0 440 150" 
                            className="w-full h-full overflow-visible" 
                            preserveAspectRatio="none"
                            onMouseLeave={() => setHoveredPoint(null)}
                        >
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff5e00" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#ff5e00" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={revenueFillPath} fill="url(#revenueGradient)" />
                            <path
                                d={revenuePath}
                                fill="none"
                                stroke="#ff5e00"
                                strokeWidth="3"
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Vertical focus line and active marker shown during hover */}
                            {hoveredPoint && (
                                <>
                                    <line x1={hoveredPoint.x} y1="0" x2={hoveredPoint.x} y2={chartHeight} stroke="#ff5e00" strokeWidth="1" strokeDasharray="4" opacity="0.4" />
                                    <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" fill="#ff5e00" stroke="white" strokeWidth="2" />
                                </>
                            )}

                            {/* Transparent interaction zones to capture mouse movements easily */}
                            {points.map((p, i) => (
                                <circle 
                                    key={i} 
                                    cx={p.x} 
                                    cy={p.y} 
                                    r="20" 
                                    fill="transparent" 
                                    onMouseEnter={() => setHoveredPoint(p)}
                                    className="cursor-pointer"
                                />
                            ))}
                        </svg>

                        {/* Floating Tooltip */}
                        {hoveredPoint && (
                            <div 
                                className="absolute bg-white/90 backdrop-blur-md border border-gray-100 p-2 shadow-xl rounded-lg pointer-events-none transition-all duration-200 z-50 text-center"
                                style={{ 
                                    left: hoveredPoint.x, 
                                    top: hoveredPoint.y - 60,
                                    transform: 'translateX(-50%)' 
                                }}
                            >
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">{hoveredPoint.month}</p>
                                <p className="text-sm font-bold text-[#ff5e00] leading-none">₹{hoveredPoint.total.toLocaleString()}</p>
                            </div>
                        )}

                        <div className="absolute top-full left-0 w-full flex justify-between px-2 pt-2 text-[10px] text-gray-400 uppercase font-medium">
                            {growth.map((g, i) => (
                                <span key={i}>{g.month}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
