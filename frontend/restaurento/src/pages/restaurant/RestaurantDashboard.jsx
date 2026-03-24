import React from 'react';
import {
    CalendarDays,
    Clock,
    DollarSign
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const RestaurantDashboard = () => {
    const weeklyData = [
        { name: 'Mon', bookings: 12, revenue: 150 },
        { name: 'Tue', bookings: 19, revenue: 230 },
        { name: 'Wed', bookings: 15, revenue: 180 },
        { name: 'Thu', bookings: 25, revenue: 320 },
        { name: 'Fri', bookings: 22, revenue: 290 },
        { name: 'Sat', bookings: 30, revenue: 450 },
        { name: 'Sun', bookings: 28, revenue: 410 },
    ];

    const recentBookings = [
        { id: 1, name: 'Olivia Martinez', time: '7:00 PM', guests: 2, status: 'Confirmed' },
        { id: 2, name: 'Benjamin Carter', time: '7:30 PM', guests: 4, status: 'Confirmed' },
        { id: 3, name: 'Sophia Lee', time: '8:15 PM', guests: 3, status: 'Pending' },
        { id: 4, name: 'Alexander White', time: '8:45 PM', guests: 2, status: 'Check-in' },
    ];

    const topDishes = [
        { name: 'Spaghetti Carbonara', orders: 128, progress: 85 },
        { name: 'Margherita Pizza', orders: 95, progress: 65 },
        { name: 'Classic Cheeseburger', orders: 72, progress: 50 },
        { name: 'Grilled Salmon', orders: 55, progress: 35 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Welcome back, Chef!</h2>
                <p className="text-gray-500 mt-1">Here's a summary of your restaurant's activity today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Today's Bookings"
                    value="12"
                    subtext="+5% from yesterday"
                    icon={<CalendarDays className="text-gray-400" />}
                />
                <StatsCard
                    title="Pending Requests"
                    value="3"
                    subtext="Needs attention"
                    icon={<Clock className="text-gray-400" />}
                />
                <StatsCard
                    title="Total Earnings (This Month)"
                    value="₹4,580"
                    subtext="+12% from last month"
                    icon={<DollarSign className="text-gray-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Booking Trends</h3>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {['Weekly', 'Monthly', 'Yearly'].map(period => (
                                <button
                                    key={period}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${period === 'Weekly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#f97316', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Top Selling Dishes</h3>
                    <div className="space-y-6">
                        {topDishes.map((dish, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-gray-700">{dish.name}</span>
                                    <span className="text-gray-500">{dish.orders} orders</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${dish.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
                    <button className="text-orange-600 text-sm font-semibold hover:text-orange-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="pb-3 font-semibold">Name</th>
                                <th className="pb-3 font-semibold">Time</th>
                                <th className="pb-3 font-semibold">Guests</th>
                                <th className="pb-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {recentBookings.map((booking) => (
                                <tr key={booking.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 font-medium text-gray-900">{booking.name}</td>
                                    <td className="py-4">{booking.time}</td>
                                    <td className="py-4">{booking.guests}</td>
                                    <td className="py-4">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
