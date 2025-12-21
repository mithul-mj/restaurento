import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LayoutDashboard, Store, Users, Flag, Calendar, DollarSign, Megaphone, Menu, X, Search, MoreHorizontal, UserX, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { register, handleSubmit } = useForm();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", link: "/admin/dashboard" },
        { icon: Store, label: "Restaurants" },
        { icon: Users, label: "Users", active: true },
        { icon: Flag, label: "Reports" },
        { icon: Calendar, label: "Bookings" },
        { icon: DollarSign, label: "Payments & Revenue" },
        { icon: Megaphone, label: "Marketing" },
    ];

    const users = [
        { id: 1, name: "Alex Johnson", email: "alex.johnson@example.com", location: "Kochi, Kerala", status: "Active", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=2080&auto=format&fit=crop" },
        { id: 2, name: "David Smith", email: "david.smith@example.com", location: "Kochi, Kerala", status: "Suspended", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop" },
        { id: 3, name: "Maria Garcia", email: "maria.garcia@example.com", location: "Kochi, Kerala", status: "Active", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop" },
        { id: 4, name: "Alex Johnson", email: "alex.johnson@example.com", location: "Kochi, Kerala", status: "Active", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" },
        { id: 5, name: "Maria Garcia", email: "maria.garcia@example.com", location: "Kochi, Kerala", status: "Active", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" },
        { id: 6, name: "David Smith", email: "david.smith@example.com", location: "Kochi, Kerala", status: "Suspended", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" },
    ];

    const onSearch = (data) => {
        console.log("Searching user:", data);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">

            {/* Sidebar Reused */}
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
                            <Link
                                key={index}
                                to={item.link || '#'}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                    ${item.active
                                        ? 'bg-[#fff5eb] text-[#ff5e00]'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
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
                            <div className="w-10 h-10 rounded-full bg-[#fff5eb] flex items-center justify-center text-[#ff5e00] font-bold">
                                A
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">Admin Name</p>
                                <p className="text-xs text-gray-400 truncate">Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

                {/* Mobile Header */}
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">User Management</h1>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                            <div>
                                <div className="bg-[#fff5eb] text-[#ff5e00] w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                                    <Users size={20} />
                                </div>
                                <p className="text-sm font-bold text-gray-900 mb-1">All Users</p>
                                <h3 className="text-3xl font-bold text-gray-900">12,456</h3>
                                <p className="text-gray-400 text-xs mt-1">Total registered users</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                            <div>
                                <div className="bg-[#fff5f5] text-red-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                                    <UserX size={20} />
                                </div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Suspended Users</p>
                                <h3 className="text-3xl font-bold text-gray-900">82</h3>
                                <p className="text-gray-400 text-xs mt-1">Accounts with temporary restrictions</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">All Users</h2>
                        <p className="text-gray-500 text-sm">Manage all active and inactive users on the platform.</p>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                        <form onSubmit={handleSubmit(onSearch)} className="w-full md:w-96 relative">
                            <input
                                type="text"
                                placeholder="Search by username, email"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#ff5e00]"
                                {...register("search")}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </form>

                        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                                Sort by: Newest
                                <ChevronDown size={16} />
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                                Status: All
                                <ChevronDown size={16} />
                            </button>
                            <button className="px-5 py-2.5 bg-[#e05200] text-white text-sm font-bold rounded-lg hover:bg-[#c94a00] transition-colors whitespace-nowrap shadow-sm shadow-orange-200">
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="space-y-4 mb-8">
                        {users.map((user) => (
                            <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900">{user.name}</h4>
                                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                                        <p className="text-[#ff5e00] text-xs font-medium md:hidden">{user.location}</p>
                                    </div>
                                </div>

                                <div className="hidden md:block text-gray-500 text-xs font-medium">
                                    {user.location}
                                </div>

                                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 md:gap-8">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full
                                        ${user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}
                                    `}>
                                        {user.status}
                                    </span>

                                    <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors
                                        ${user.status === 'Active'
                                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }
                                    `}>
                                        {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                        <p className="text-xs text-gray-500">Showing <span className="font-bold text-gray-900">1</span> to <span className="font-bold text-gray-900">4</span> of <span className="font-bold text-gray-900">27</span> results</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                Previous
                            </button>
                            <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                Next
                            </button>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default UserManagement;
