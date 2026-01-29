import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../admin/Sidebar';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const getActivePage = () => {
        const path = location.pathname;
        if (path === '/admin/dashboard') return 'Dashboard';
        if (path === '/admin/restaurants') return 'Restaurants';
        if (path === '/admin/users') return 'Users';
        if (path === '/admin/reports') return 'Reports';
        if (path === '/admin/bookings') return 'Bookings';
        if (path === '/admin/finance') return 'Payments & Revenue';
        if (path === '/admin/marketing') return 'Marketing';
        return 'Dashboard';
    };

    const activePage = getActivePage();

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                activePage={activePage}
            />

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
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
