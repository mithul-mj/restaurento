import React from 'react';
import {
    LayoutDashboard,
    CalendarDays,
    UtensilsCrossed,
    TrendingUp,
    Settings,
    X,
    LogOut,
    Maximize,
    Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';

const Sidebar = ({ isOpen, setIsOpen, activeTab }) => {
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/restaurant/dashboard' },
        { id: 'bookings', icon: CalendarDays, label: 'Bookings', path: '/restaurant/bookings' },
        { id: 'check-in', icon: Maximize, label: 'Scan & Check-in', path: '/restaurant/check-in' },
        { id: 'menu', icon: UtensilsCrossed, label: 'Menu', path: '/restaurant/menu' },
        { id: 'offers', icon: Gift, label: 'My Offers', path: '/restaurant/offers' },
        { id: 'earnings', icon: TrendingUp, label: 'Earnings', path: '/restaurant/earnings' },
        { id: 'settings', icon: Settings, label: 'Settings', path: '/restaurant/settings' },
    ];

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
            <div className="h-full flex flex-col">
                <div className="px-6 py-6 border-b border-gray-50 flex items-center gap-3">
                    <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center">
                        <span className="font-bold text-lg">R</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">Restaurento</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden ml-auto text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                        ${activeTab === item.id
                                    ? "bg-[#fff5eb] text-[#ff5e00]"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }
                    `}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="px-6 py-6 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#fff5eb] flex items-center justify-center text-[#ff5e00] font-bold overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${user?.fullName || user?.name || 'Chef+Owner'}&background=ff5e00&color=fff`} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {user?.fullName || user?.name || 'Chef Owner'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">Restaurant Owner</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
