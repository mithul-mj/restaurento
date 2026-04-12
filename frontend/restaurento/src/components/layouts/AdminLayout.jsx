import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../admin/Sidebar';
import { Menu } from 'lucide-react';
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../ErrorFallback";

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
        if (path.startsWith('/admin/coupons')) return 'Coupons';
        if (path.startsWith('/admin/banners')) return 'Banners';
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
                    <div className="flex items-center">
                        <img
                            src="/text.png"
                            alt="Restaurento"
                            className="h-7 w-auto"
                        />
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500">
                        <Menu size={24} />
                    </button>
                </header>

                <main className="p-6 md:p-10 flex-1 overflow-x-hidden">
                    <ErrorBoundary
                        FallbackComponent={ErrorFallback}
                        resetKeys={[location.pathname]}
                    >
                        <Outlet />
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
