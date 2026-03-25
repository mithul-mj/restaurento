import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import authService from '../../services/auth.service';
import { showConfirm, showToast } from '../../utils/alert';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import PageLoader from '../../components/PageLoader';
import { useState } from 'react';
import { Calendar } from 'lucide-react';

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

    const chartWidth = 440;
    const chartHeight = 150;
    // Calculate the ceiling of the graph to ensure lines stay within bounds
    const maxVal = Math.max(...growth.map(g => g.commissions || 0), 1);
    
    // Convert raw business metrics into visual coordinates for the horizontal timeline
    const pointsCount = growth.length > 0 ? growth.length - 1 : 1;
    const points = growth.map((g, i) => ({
        x: (i / pointsCount) * chartWidth,
        y: chartHeight - (((g.commissions || 0) / (maxVal * 1.5)) * chartHeight) - 20,
        label: g.label,
        commissions: g.commissions || 0
    }));

    // Trace a fluid, organic cubic bezier path through the growth data points for a high-end feel
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

    const periodTotal = growth.reduce((sum, g) => sum + (g.commissions || 0), 0);
    const timeframeTitle = timeframe === 'day' ? 'Today' : timeframe === 'week' ? 'Week' : timeframe === 'month' ? 'Month' : 'Year';
    const timeframeLabel = timeframe === "day" ? "today" : timeframe === "week" ? "this week" : timeframe === "month" ? "this month" : "this year";

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Admin Dashboard</h1>
                    <p className="text-gray-500 font-medium md:text-lg opacity-80 italic">Global platform intelligence for {timeframe === 'day' ? 'Today' : timeframe === 'week' ? 'this Week' : timeframe === 'month' ? 'this Month' : 'this Year'}.</p>
                </div>

                <div className="relative group">
                    <div className="flex items-center gap-8 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all group-hover:border-gray-300">
                        <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                            Timeframe: <span className="text-[#ff5e00] ml-0.5">{timeframe === 'week' ? 'Weekly' : timeframe === 'month' ? 'Monthly' : 'Yearly'}</span>
                        </span>
                        <Calendar size={20} className="text-[#ff5e00]" />
                    </div>
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#ff5e00]/20 group">
                        <div className="relative z-10">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                                {stat.label}
                                {stat.badge && (
                                    <span className="bg-[#ff5e00] text-white text-[9px] px-2 py-0.5 rounded-lg font-black animate-pulse shadow-sm">{stat.badge}</span>
                                )}
                            </p>
                            <h3 className={`text-2xl md:text-3xl font-bold tracking-tight ${stat.color || 'text-gray-900'}`}>{stat.value}</h3>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff5e00]/5 rounded-bl-full translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-500"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Booking Trends</h3>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Top performing restaurants {timeframeLabel}</p>
                        </div>
                    </div>

                    <div className="space-y-6 pr-2">
                        {trends.length > 0 ? trends.map((item, i) => (
                            <div key={i} className="group animate-in slide-in-from-left-4 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-2">
                                    <span className="w-24 text-right shrink-0 truncate text-[10px]">{item.name}</span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#ff5e00] to-[#ff8c00] rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: item.width }}
                                        ></div>
                                    </div>
                                    <span className="w-8 font-black text-gray-900 text-[11px]">{item.value}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-gray-400 font-bold italic text-sm opacity-50">No booking data found for this period</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="mb-6">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Financial Growth</h3>
                            <div className="flex items-baseline gap-3 mt-3">
                                <span className="text-4xl font-black text-[#ff5e00] tracking-tighter">₹{periodTotal.toLocaleString()}</span>
                                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{timeframeTitle} Commission</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-48 w-full mt-8 pr-4">
                        <svg 
                            viewBox="0 0 440 150" 
                            className="w-full h-full overflow-visible" 
                            preserveAspectRatio="none"
                            onMouseLeave={() => setHoveredPoint(null)}
                        >
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff5e00" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#ff5e00" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={revenueFillPath} fill="url(#revenueGradient)" />
                            <path
                                d={revenuePath}
                                fill="none"
                                stroke="#ff5e00"
                                strokeWidth="4"
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-sm"
                            />

                            {hoveredPoint && (
                                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" fill="#ff5e00" stroke="white" strokeWidth="2" className="animate-pulse" />
                            )}

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

                        {hoveredPoint && (
                            <div 
                                className="absolute bg-white border border-gray-100 p-2 shadow-2xl rounded-xl pointer-events-none transition-all duration-300 z-50 text-center animate-in zoom-in-50"
                                style={{ 
                                    left: hoveredPoint.x, 
                                    top: hoveredPoint.y - 65,
                                    transform: 'translateX(-50%)' 
                                }}
                            >
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 font-sans">{hoveredPoint.label} {growth[0]?.year}</p>
                                <p className="text-sm font-black text-[#ff5e00] leading-none tracking-tight">₹{(hoveredPoint.commissions || 0).toLocaleString()}</p>
                            </div>
                        )}

                        <div className="absolute top-full left-0 w-full flex justify-between px-2 pt-4 text-[9px] text-gray-400 uppercase font-black tracking-widest opacity-60">
                            {growth.map((g, i) => (
                                <span key={i}>{g.label}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ecosystem Pulse: User vs Restaurant Growth */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-10 overflow-hidden relative">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Ecosystem Pulse</h3>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-1">Acquisition ratio: New Users vs New Restaurants</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">New Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#ff5e00] rounded-sm"></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">New Restaurants</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-end gap-0.5 md:gap-1.5 h-40 pb-4">
                    {growth.map((g, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 h-full flex-1 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 30}ms` }}>
                            <div className="flex-1 flex items-end gap-[1px] md:gap-0.5 w-full justify-center">
                                {/* User Bar */}
                                <div 
                                    className="w-full max-w-[12px] md:max-w-[20px] bg-blue-500 rounded-t-sm transition-all duration-1000 ease-out shadow-sm relative group cursor-help"
                                    style={{ height: `${Math.max((g.users / (Math.max(...growth.map(d => Math.max(d.users, d.restaurants)), 1))) * 100, 5)}%` }}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold z-10 whitespace-nowrap shadow-xl">
                                        Users: {g.users}
                                    </div>
                                </div>
                                <div 
                                    className="w-full max-w-[12px] md:max-w-[20px] bg-[#ff5e00] rounded-t-sm transition-all duration-1000 ease-out shadow-sm relative group cursor-help"
                                    style={{ height: `${Math.max((g.restaurants / (Math.max(...growth.map(d => Math.max(d.users, d.restaurants)), 1))) * 100, 3)}%` }}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold z-10 whitespace-nowrap shadow-xl">
                                        Rests: {g.restaurants}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter truncate w-full text-center opacity-60">{g.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
