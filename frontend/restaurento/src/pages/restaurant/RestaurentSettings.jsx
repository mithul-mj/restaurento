import React, { useState } from 'react';
import {
    LayoutDashboard,
    CalendarCheck,
    UtensilsCrossed,
    BarChart3,
    Settings,
    Wallet,
    HelpCircle,
    Bell
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { showConfirm } from '../../utils/alert';
import authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/alert';
import { showError } from '../../utils/alert';

const RestaurantSettings = () => {
    const dispatch = useDispatch();
    const [isClosed, setIsClosed] = useState(false);

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Bookings', icon: <CalendarCheck size={20} /> },
        { name: 'Menu', icon: <UtensilsCrossed size={20} /> },
        { name: 'Earnings', icon: <BarChart3 size={20} /> },
        { name: 'Settings', icon: <Settings size={20} />, active: true },
        { name: 'Wallet & Payout', icon: <Wallet size={20} /> },
    ];

    const handleLogout = async () => {
        const result = await showConfirm(
            "Logout",
            "Are you sure you want to logout?",
            "Yes, Logout"
        );
        if (result.isConfirmed) {
            try {
                await authService.logout("RESTAURANT");
                showToast("Logged out successfully", "success");
            } catch (error) {
                console.error("Logout failed", error);
            } finally {
                dispatch(logout());
                navigate("/restaurant/login");
            }
        }
    };
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 flex items-center gap-2">
                    <div className="bg-orange-500 text-white p-1 rounded-md">
                        <span className="font-bold text-xl">A</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Restauranto</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${item.active
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-orange-50'
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center gap-3 px-4 py-2 text-gray-600 text-sm hover:text-orange-500">
                        <HelpCircle size={20} />
                        Help
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <h2 className="text-sm font-semibold text-gray-500">Menu Management</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Bell className="text-gray-400" size={20} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">4</span>
                        </div>
                        <div className="w-8 h-8 bg-orange-200 rounded-full border border-orange-300"></div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="max-w-3xl mx-auto py-12 px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Manage Your Restaurant Profile</h2>

                    <div className="space-y-4">
                        {/* Toggle Card */}
                        <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-xl flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-800">Restaurant is Temporarily Closed</h3>
                                <p className="text-sm text-orange-600/70 mt-1">
                                    Activating this will stop new booking requests and display a 'Temporarily Closed' badge to users.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsClosed(!isClosed)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${isClosed ? 'bg-orange-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isClosed ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>

                        {/* Standard Edit Cards */}
                        {[
                            { label: 'Edit Your Restaurant Details', btn: 'edit' },
                            { label: 'Email : mithulmj2004@gmail.com', btn: 'edit' },
                            { label: 'Change Password', btn: 'Change' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{item.label}</h3>
                                    <div className="h-1 w-1 bg-orange-300 rounded-full mt-2"></div>
                                </div>
                                <button className="px-6 py-1.5 bg-orange-100 text-orange-600 rounded-md text-sm font-bold hover:bg-orange-200 transition-colors uppercase">
                                    {item.btn}
                                </button>
                            </div>
                        ))}

                        {/* Logout Card */}
                        <div className="bg-red-50/30 border border-red-100 p-5 rounded-xl flex items-center justify-between mt-8">
                            <div>
                                <h3 className="font-bold text-red-500">Log Out</h3>
                                <p className="text-sm text-gray-500 mt-1">You will be returned to the login screen.</p>
                            </div>
                            <button className="px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 shadow-md transition-all" onClick={handleLogout}>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RestaurantSettings;