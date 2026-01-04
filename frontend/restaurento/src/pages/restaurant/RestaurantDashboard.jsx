import React, { useState } from 'react';
import {
    LayoutDashboard,
    CalendarDays,
    UtensilsCrossed,
    TrendingUp,
    Settings,
    Wallet,
    Bell,
    User,
    Menu,
    X,
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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);


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

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">

                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back, Chef!</h2>
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
                                value="$4,580"
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

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                            <Settings className="text-orange-500" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Work in Progress</h2>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            The <span className="font-semibold text-gray-800 capitalize">{activeTab}</span> dashboard module is currently under development. Stay tuned!
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">


            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}


            <aside
                className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            R
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900">Restauranto</span>
                    </div>
                    <button className="md:hidden text-gray-500" onClick={() => setIsMobileSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        text="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<CalendarDays size={20} />}
                        text="Bookings"
                        active={activeTab === 'bookings'}
                        onClick={() => { setActiveTab('bookings'); setIsMobileSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<UtensilsCrossed size={20} />}
                        text="Menu"
                        active={activeTab === 'menu'}
                        onClick={() => { setActiveTab('menu'); setIsMobileSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<TrendingUp size={20} />}
                        text="Earnings"
                        active={activeTab === 'earnings'}
                        onClick={() => { setActiveTab('earnings'); setIsMobileSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<Wallet size={20} />}
                        text="Wallet & Payout"
                        active={activeTab === 'wallet'}
                        onClick={() => { setActiveTab('wallet'); setIsMobileSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<Settings size={20} />}
                        text="Settings"
                        active={activeTab === 'settings'}
                        onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
                    />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Chef+Owner&background=random" alt="User" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Chef Owner</p>
                            <p className="text-xs text-gray-500">View Profile</p>
                        </div>
                    </div>
                </div>
            </aside>


            <main className="flex-1 overflow-y-auto h-screen">


                <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500 p-1" onClick={() => setIsMobileSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <User size={20} />
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};


const SidebarItem = ({ icon, text, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        <span className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {icon}
        </span>
        <span className="font-medium text-sm">{text}</span>
    </button>
);

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
