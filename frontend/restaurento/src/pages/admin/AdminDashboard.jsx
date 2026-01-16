import React, { useState } from 'react';
import { LayoutDashboard, Store, Users, Flag, Calendar, DollarSign, Megaphone, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import authService from '../../services/auth.service';
import { showConfirm, showToast } from '../../utils/alert';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", active: true, link: "/admin/dashboard" },
        { icon: Store, label: "Restaurants" },
        { icon: Users, label: "Users", link: "/admin/users" },
        { icon: Flag, label: "Reports" },
        { icon: Calendar, label: "Bookings" },
        { icon: DollarSign, label: "Payments & Revenue" },
        { icon: Megaphone, label: "Marketing" },
    ];

    const stats = [
        { label: "Total Restaurants", value: "1,245", badge: null },
        { label: "Pending Approvals", value: "12", badge: "12" },
        { label: "Total Earnings", value: "$1.45M", badge: null },
        { label: "Pending Reports", value: "8", badge: "8" },
    ];


    const revenuePath = "M0,100 C20,100 20,40 40,40 C60,40 60,60 80,60 C100,60 100,20 120,20 C140,20 140,80 160,80 C180,80 180,50 200,50 C240,50 240,120 280,120 C300,120 300,20 320,20 C340,20 340,80 360,80 C380,80 380,110 400,110 C420,110 420,40 440,40";


    const revenueFillPath = `${revenuePath} L440,150 L0,150 Z`;

    const rankingData = [
        { name: "The Gourmet Kitchen", value: "8.5k", width: "90%" },
        { name: "Bistro Verde", value: "7.0k", width: "75%" },
        { name: "Sushi House", value: "6.0k", width: "65%" },
        { name: "Taco Town", value: "3.0k", width: "35%" },
        { name: "The Golden Spoon", value: "4.5k", width: "50%" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">


            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="px-6 py-6 border-b border-gray-50 flex items-center gap-3">
                        <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center">
                            <span className="font-bold text-lg">A</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">Restauranto</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {menuItems.map((item, index) => (
                            <a
                                key={index}
                                href="#"
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                    ${item.active
                                        ? 'bg-[#fff5eb] text-[#ff5e00]'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="px-6 py-6 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#fff5eb] flex items-center justify-center text-[#ff5e00] font-bold">
                                A
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">Admin Name</p>
                                <p className="text-xs text-gray-400 truncate">Administrator</p>
                            </div>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>


            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">


                <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#ff5e00] text-white p-1 rounded-md flex items-center justify-center">
                            <span className="font-bold text-sm">A</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900">Restauranto</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500">
                        <Menu size={24} />
                    </button>
                </header>

                <main className="p-6 md:p-10 flex-1 overflow-x-hidden">
                    <div className="mb-10">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">High-level overview of platform activity.</p>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1 flex justify-between items-center">
                                    {stat.label}
                                    {stat.badge && (
                                        <span className="bg-[#ff5e00] text-white text-[10px] px-1.5 py-0.5 rounded-full">{stat.badge}</span>
                                    )}
                                </p>
                                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Booking Trends by Restaurent</h3>
                                    <p className="text-gray-400 text-xs">Most popular restaurants this month based on completed orders</p>
                                </div>
                                <div className="flex bg-gray-50 rounded-lg p-1 text-xs font-medium">
                                    <button className="px-3 py-1 rounded-md text-gray-500 hover:text-gray-900">Day</button>
                                    <button className="px-3 py-1 rounded-md bg-white text-[#ff5e00] shadow-sm">Month</button>
                                    <button className="px-3 py-1 rounded-md text-gray-500 hover:text-gray-900">Year</button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {rankingData.map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-1.5">
                                            <span className="w-32 text-right shrink-0 truncate">{item.name}</span>
                                            <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#ff5e00] rounded-full group-hover:bg-[#e05200] transition-all duration-500"
                                                    style={{ width: item.width }}
                                                ></div>
                                            </div>
                                            <span className="w-8 font-bold text-gray-900">{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="mb-6">
                                <h3 className="font-bold text-lg text-gray-900">Revenue Trends</h3>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-3xl font-bold text-[#ff5e00]">$250,840</span>
                                    <span className="text-xs text-gray-400">Last 6 months</span>
                                </div>
                            </div>

                            <div className="relative h-48 w-full mt-8">
                                <svg viewBox="0 0 440 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
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
                                </svg>


                                <div className="absolute top-full left-0 w-full flex justify-between px-2 pt-2 text-[10px] text-gray-400 uppercase font-medium">
                                    <span>Jan</span>
                                    <span>Feb</span>
                                    <span>Mar</span>
                                    <span>Apr</span>
                                    <span>May</span>
                                    <span>Jun</span>
                                </div>
                            </div>
                        </div>

                    </div>


                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
