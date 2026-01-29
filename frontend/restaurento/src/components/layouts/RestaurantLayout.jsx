import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../restaurant/Sidebar';
import { Menu } from 'lucide-react';

const RestaurantLayout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation();

    const getActiveTab = () => {
        const path = location.pathname.split('/restaurant/')[1] || 'dashboard';
        return path;
    };

    const activeTab = getActiveTab();

    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            <Sidebar
                isOpen={isMobileSidebarOpen}
                setIsOpen={setIsMobileSidebarOpen}
                activeTab={activeTab}
            />

            <main className="flex-1 overflow-y-auto h-screen flex flex-col">
                <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
                    <button className="text-gray-500 p-1" onClick={() => setIsMobileSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h1>
                    <div className="w-8"></div>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)] w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default RestaurantLayout;
