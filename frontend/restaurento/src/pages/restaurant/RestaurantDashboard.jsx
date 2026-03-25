import React, { useState } from 'react';
import {
    CalendarDays,
    Clock,
    DollarSign,
    TrendingUp,
    Coins
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { useRestaurantDashboard } from '../../hooks/useRestaurantDashboard';
import PageLoader from '../../components/PageLoader';

const RestaurantDashboard = () => {
    const [timeframe, setTimeframe] = useState('thisMonth');
    const { data: dashboardData, isLoading } = useRestaurantDashboard(timeframe);

    if (isLoading) return <PageLoader />;

    const stats = dashboardData?.data?.metrics || {};
    const trend = dashboardData?.data?.trend || [];
    const topDishes = dashboardData?.data?.topDishes || [];
    const hourlyData = dashboardData?.data?.hourlyWiseBookings || [];

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    const timeframeMap = {
        thisWeek: 'Weekly',
        thisMonth: 'Monthly',
        thisYear: 'Yearly'
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, Chef!</h2>
                    <p className="text-gray-500 mt-1 font-medium">Monitoring your restaurant's activity for {timeframeMap[timeframe].toLowerCase()}.</p>
                </div>

                    <div className="relative group">
                        <div className="flex items-center gap-8 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all group-hover:border-gray-300">
                            <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                                Timeframe: <span className="text-[#ff5e00] ml-0.5">{timeframe === 'thisWeek' ? 'Weekly' : timeframe === 'thisMonth' ? 'Monthly' : 'Yearly'}</span>
                            </span>
                            <CalendarDays size={20} className="text-[#ff5e00]" />
                        </div>
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            <option value="thisWeek">Weekly</option>
                            <option value="thisMonth">Monthly</option>
                            <option value="thisYear">Yearly</option>
                        </select>
                    </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title={`${timeframeMap[timeframe]} Bookings`}
                    value={stats.successfulBookings || 0}
                    subtext="Paid & confirmed orders"
                    icon={<CalendarDays className="text-blue-500" size={20} />}
                />
                <StatsCard
                    title="Canceled"
                    value={stats.canceledBookings || 0}
                    subtext="Refunded or voided"
                    icon={<Clock className="text-red-500" size={20} />}
                />
                <StatsCard
                    title={`${timeframeMap[timeframe]} Revenue`}
                    value={formatCurrency(stats.totalRevenue || 0)}
                    subtext="Net successful earnings"
                    icon={<TrendingUp className="text-green-500" size={20} />}
                />
                <StatsCard
                    title="Avg. Spend / Order"
                    value={formatCurrency(stats.averageOrderValue || 0)}
                    subtext="Average customer value"
                    icon={<Coins className="text-amber-500" size={20} />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Booking Trends</h3>
                            <p className="text-xs text-gray-400">Activity distribution for the tracked window</p>
                        </div>
                        <div className="h-64 w-full pr-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trend}>
                                    <defs>
                                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff5e00" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ff5e00" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        width={30}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#ff5e00', strokeWidth: 1 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="bookings"
                                        stroke="#ff5e00"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorBookings)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Busy Hours (Peak Times)</h3>
                            <p className="text-xs text-gray-400">Tracked volume to help with staffing recommendations</p>
                        </div>
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis 
                                        dataKey="time" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9ca3af', fontSize: 9 }}
                                        interval={2}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8f9fa' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={2000}>
                                        {hourlyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#ff5e00' : '#f3f4f6'} fillOpacity={entry.count > 0 ? 0.9 : 1} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden h-fit">
                    <h3 className="text-lg font-bold text-gray-800 tracking-tight mb-2">Popular Dishes</h3>
                    <p className="text-xs text-gray-400 mb-6 font-medium">Customer favorites from this window's orders</p>
                    <div className="space-y-6">
                        {topDishes.length > 0 ? topDishes.map((dish, i) => (
                            <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-gray-700 truncate mr-2">{dish.name}</span>
                                    <span className="text-[#ff5e00] shrink-0">{dish.orders} <span className="text-[10px] text-gray-400 uppercase">sold</span></span>
                                </div>
                                <div className="w-full bg-gray-50 rounded-full h-1.5 border border-gray-100">
                                    <div
                                        className="bg-[#ff5e00] h-1.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${dish.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-xs italic">No sales data recorded for this period yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, subtext, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
                {icon}
            </div>
        </div>
        <p className="text-sm text-gray-400">{subtext}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Confirmed: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        'Check-in': 'bg-blue-100 text-blue-700',
        Cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

export default RestaurantDashboard;
