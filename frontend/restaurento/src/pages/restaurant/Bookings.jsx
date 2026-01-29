import React from 'react';
import { CalendarDays } from 'lucide-react';

const Bookings = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <CalendarDays className="text-orange-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
            <p className="text-gray-500 mt-2 max-w-sm">
                Manage your restaurant bookings here.
            </p>
        </div>
    );
};

export default Bookings;
