import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Clock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

// Day names constant - index determines the day (0=Monday, 1=Tuesday, etc.)
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EditSlotsModal = ({ onClose }) => {

    const { watch, setValue } = useFormContext();


    const openingHours = watch("openingHours");
    const isSameEveryDay = openingHours?.isSameEveryDay;
    const days = openingHours?.days || [];

    // Helper format 24h to 12h AM/PM
    const formatTime = (time) => {
        if (!time) return "";
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
    };


    const removeSlot = (dayIndex, slotIndex) => {

        const currentSlots = [...days[dayIndex].generatedSlots];

        currentSlots.splice(slotIndex, 1);

        setValue(`openingHours.days.${dayIndex}.generatedSlots`, currentSlots);
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">


                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Time Slots</h2>
                        <p className="text-sm text-gray-500">Review and remove specific slots for your business hours.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>


                <div className="p-6 overflow-y-auto space-y-8">
                    {days.map((day, dayIndex) => {

                        if (isSameEveryDay && dayIndex > 0) return null;

                        return (
                            <div key={dayIndex} className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-bold text-[#ff5e00] uppercase tracking-wider text-sm">
                                        {isSameEveryDay ? "Every Day Schedule" : DAY_NAMES[dayIndex]}
                                    </h3>
                                    {day.isClosed && (
                                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                                            CLOSED
                                        </span>
                                    )}
                                </div>


                                {(!day.generatedSlots || day.generatedSlots.length === 0) && !day.isClosed && (
                                    <p className="text-sm text-gray-400 italic">No slots generated for this period.</p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {day.generatedSlots?.map((slot, slotIndex) => (
                                        <div
                                            key={slotIndex}
                                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-orange-200 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 text-gray-700 font-medium">
                                                <Clock size={16} className="text-gray-400" />
                                                <span>{formatTime(slot.startTime)}</span>
                                                <span className="text-gray-300">-</span>
                                                <span>{formatTime(slot.endTime)}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSlot(dayIndex, slotIndex)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove Slot"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>


                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-2.5 bg-[#ff5e00] text-white font-bold rounded-lg hover:bg-[#e05200] transition-colors shadow-lg shadow-orange-100"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );


    return createPortal(modalContent, document.getElementById('modal-root'));
};

export default EditSlotsModal;