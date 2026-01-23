import React, { useState, useEffect } from 'react';
import { formatTime12Hour } from '../../utils/timeUtils';

const DAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const TimeSlotViewer = ({ days = [] }) => {
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    // Create a stable string signature of which days are open/closed
    // This ensures we only reset the view if the schedule *actually* changes, not just on re-renders.
    const scheduleSignature = days.map(d => d.isClosed ? '0' : '1').join('');

    useEffect(() => {
        if (days && days.length > 0) {
            const firstOpen = days.findIndex((day) => !day.isClosed);
            if (firstOpen !== -1) {
                setSelectedDayIndex(firstOpen);
            } else {
                setSelectedDayIndex(0);
            }
        }
    }, [scheduleSignature]); // Only re-run if the open/closed schedule changes

    const selectedDay = days[selectedDayIndex];
    // Safety check in case selectedDayIndex is out of bounds relative to new days array
    const safeSelectedDay = selectedDay || (days.length > 0 ? days[0] : null);
    const slots = safeSelectedDay?.generatedSlots || [];

    // If no days provided, render nothing or empty state
    if (!days || days.length === 0) {
        return <div className="text-gray-400 text-sm">No schedule information available.</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin">
                {days.map((day, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedDayIndex(index)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center p-3 min-w-[4rem] rounded-xl border transition-all ${selectedDayIndex === index
                            ? "border-[#ff5e00] bg-orange-50 text-[#ff5e00] shadow-sm"
                            : "border-transparent text-gray-400 hover:bg-gray-50"
                            }`}>
                        <span className="text-xs uppercase font-bold tracking-wider">
                            {DAY_NAMES[index].substring(0, 3)}
                        </span>
                        <div
                            className={`w-1.5 h-1.5 rounded-full mt-1.5 ${day.isClosed ? "bg-gray-200" : "bg-green-400"}`}></div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {safeSelectedDay?.isClosed ? (
                    <div className="col-span-full text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Closed on {DAY_NAMES[selectedDayIndex]}
                    </div>
                ) : slots.length > 0 ? (
                    slots.map((slot, idx) => (
                        <div
                            key={idx}
                            className="py-2.5 px-2 border border-gray-100 rounded-lg text-center text-sm font-medium text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ff5e00] cursor-pointer transition-colors shadow-sm">
                            {formatTime12Hour(slot.startTime)} -{" "}
                            {formatTime12Hour(slot.endTime)}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No slots generated
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeSlotViewer;
