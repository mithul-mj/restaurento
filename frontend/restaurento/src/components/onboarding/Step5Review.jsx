import React, { useState, useEffect } from 'react';
import { useFormContext } from "react-hook-form";
import { MapPin, Clock, Phone, Search, ChefHat, Users, Wallet } from "lucide-react";
import { minutesToTime } from '../../utils/timeUtils';
import { calculateSlots } from '../../utils/slotGenerator';

// Day names constant - index determines the day (0=Monday, 1=Tuesday, etc.)
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (img.preview) return img.preview;
    if (Array.isArray(img) && img.length > 0) {
        const first = img[0];
        if (typeof first === 'string') return first;
        if (first.preview) return first.preview;
    }
    return null;
};

const formatTime = (time) => {
    if (time === undefined || time === null) return "";

    let timeStr = time;
    if (typeof time === 'number') {
        timeStr = minutesToTime(time);
    }

    const [h, m] = timeStr.toString().split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
};

const ImgDiv = ({ src, className }) => (
    <div className={`overflow-hidden w-full h-full ${className || ''} bg-gray-100 flex-shrink-0`}>
        {src ? (
            <img
                src={src}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                alt="Restaurant"
                style={{ minHeight: '100%', minWidth: '100%' }}
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ChefHat size={24} />
            </div>
        )}
    </div>
);

const Step5Review = () => {
    const { watch, register, setValue, formState: { errors, isSubmitting } } = useFormContext();
    const values = watch();
    const [activeTab, setActiveTab] = useState("Dinner");
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    const displayTags = values.tags && values.tags.length > 0
        ? values.tags
        : ["Fine Dining", "Authentic", "Romantic"];

    const menuItems = values.menuItems || [];
    const filteredItems = menuItems.filter(item => {
        const cats = item.categories || [item.category];
        return cats.includes(activeTab);
    });

    const heroImages = values.images || [];

    const previewUrls = React.useMemo(() => {
        const flatImages = Array.isArray(heroImages) ? heroImages.flat() : [];

        console.log("Raw Images from Form:", flatImages);

        const urls = flatImages.map(img => {
            if (typeof img === 'string') return img;
            if (img?.preview) return img.preview;

            console.warn('Image missing preview property:', img);
            return null;
        }).filter(Boolean);

        console.log("Generated Previews:", urls);
        return urls;
    }, [heroImages]);

    const days = values.openingHours?.days || [];
    const selectedDay = days[selectedDayIndex];
    const slots = selectedDay?.generatedSlots || [];
    const slotConfig = values.slotConfig;

    // Fallback: Calculate slots if they are missing
    useEffect(() => {
        if (!days.length || !slotConfig) return;

        let hasUpdates = false;
        const updatedDays = days.map((day) => {
            if (!day.isClosed && day.startTime && day.endTime && (!day.generatedSlots || day.generatedSlots.length === 0)) {
                const newSlots = calculateSlots(day.startTime, day.endTime, slotConfig.duration, slotConfig.gap);
                if (newSlots.length > 0) {
                    hasUpdates = true;
                    return { ...day, generatedSlots: newSlots };
                }
            }
            return day;
        });

        if (hasUpdates) {
            console.log("Regenerating missing slots in Step5Review...");
            setValue("openingHours.days", updatedDays);
        }
    }, [days.length, selectedDayIndex]);

    useEffect(() => {
        if (days.length > 0) {
            const firstOpen = days.findIndex(d => !d.isClosed);
            if (firstOpen !== -1) setSelectedDayIndex(firstOpen);
        }
    }, [values.openingHours]);


    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 font-inter">

            <div className="space-y-6">
                {(() => {
                    let displayImages = [];

                    if (previewUrls.length > 0) {
                        displayImages = previewUrls.slice(0, 5);
                    } else if (heroImages.length > 0) {
                        displayImages = Array(Math.min(heroImages.length, 5)).fill(null);
                    } else {
                        displayImages = [
                            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
                            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600",
                            "https://images.unsplash.com/photo-1550966871-3ed3c6221741?w=600"
                        ];
                    }

                    const count = displayImages.length;

                    if (count === 1) {
                        return (
                            <div className="h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
                                <ImgDiv src={displayImages[0]} />
                            </div>
                        );
                    }
                    if (count === 2) {
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
                                <div className="h-full w-full"><ImgDiv src={displayImages[0]} /></div>
                                <div className="h-full w-full"><ImgDiv src={displayImages[1]} /></div>
                            </div>
                        );
                    }
                    if (count === 3) {
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
                                <div className="md:col-span-2 h-full"><ImgDiv src={displayImages[0]} /></div>
                                <div className="grid grid-rows-2 gap-2 h-full">
                                    <div className="h-full w-full"><ImgDiv src={displayImages[1]} /></div>
                                    <div className="h-full w-full"><ImgDiv src={displayImages[2]} /></div>
                                </div>
                            </div>
                        );
                    }
                    if (count === 4) {
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
                                <div className="h-full w-full"><ImgDiv src={displayImages[0]} /></div>
                                <div className="h-full w-full flex flex-col gap-2">
                                    <div className="flex-1 w-full min-h-0"><ImgDiv src={displayImages[1]} /></div>
                                    <div className="flex-1 w-full min-h-0 grid grid-cols-2 gap-2">
                                        <div className="h-full w-full"><ImgDiv src={displayImages[2]} /></div>
                                        <div className="h-full w-full"><ImgDiv src={displayImages[3]} /></div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-2 h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
                            <div className="h-full w-full"><ImgDiv src={displayImages[0]} /></div>
                            <div className="h-full w-full flex flex-col gap-2">
                                <div className="flex-1 w-full min-h-0"><ImgDiv src={displayImages[1]} /></div>
                                <div className="flex-1 w-full min-h-0"><ImgDiv src={displayImages[2]} /></div>
                            </div>
                            <div className="h-full w-full flex flex-col gap-2">
                                <div className="flex-1 w-full min-h-0"><ImgDiv src={displayImages[3]} /></div>
                                <div className="flex-1 w-full min-h-0"><ImgDiv src={displayImages[4]} /></div>
                            </div>
                        </div>
                    );
                })()}


            </div>

            <div className="max-w-5xl mx-auto">
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
                            <div className="flex items-center gap-2 mb-3">
                                <ChefHat className="text-[#ff5e00]" size={20} />
                                <h2 className="text-xl font-bold text-gray-900">About {values.restaurantName || "The Restaurant"}</h2>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {displayTags.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full border border-orange-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {values.description || "Experience culinary excellence with our carefully curated menu and ambiance. Join us for an unforgettable dining journey."}
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <Users className="text-[#ff5e00]" size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Seating Capacity</p>
                                        <p className="font-bold text-gray-900 text-sm">{values.totalSeats || 0} Seats</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <Wallet className="text-[#ff5e00]" size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Average Price</p>
                                        <p className="font-bold text-gray-900 text-sm">₹{values.slotPrice || 0} / person</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="text-[#ff5e00]" size={20} />
                                <h2 className="text-xl font-bold text-gray-900">Opening Hours</h2>
                            </div>
                            <div className="space-y-5 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 bg-orange-50 rounded-lg">
                                        <Clock className="text-[#ff5e00]" size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 mb-2">Weekly Schedule</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                            {days.map((day, i) => (
                                                <p key={i} className={`flex justify-between text-xs ${day.isClosed ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    <span className="font-medium w-16">{DAY_NAMES[i].substring(0, 3)}</span>
                                                    {day.isClosed ? (
                                                        <span className="italic">Closed</span>
                                                    ) : (
                                                        <span>{formatTime(day.startTime)} - {formatTime(day.endTime)}</span>
                                                    )}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Time Slots</h2>
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin">
                                {days.map((day, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setSelectedDayIndex(index)}
                                        className={`flex-shrink-0 flex flex-col items-center justify-center p-3 min-w-[4rem] rounded-xl border transition-all ${selectedDayIndex === index
                                            ? 'border-[#ff5e00] bg-orange-50 text-[#ff5e00] shadow-sm'
                                            : 'border-transparent text-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-xs uppercase font-bold tracking-wider">{DAY_NAMES[index].substring(0, 3)}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${day.isClosed ? 'bg-gray-200' : 'bg-green-400'}`}></div>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedDay?.isClosed ? (
                                    <div className="col-span-full text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        Closed on {DAY_NAMES[selectedDayIndex]}
                                    </div>
                                ) : slots.length > 0 ? (
                                    slots.map((slot, idx) => (
                                        <div
                                            key={idx}
                                            className="py-2.5 px-2 border border-gray-100 rounded-lg text-center text-sm font-medium text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ff5e00] cursor-pointer transition-colors shadow-sm"
                                        >
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        No slots generated
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            <div className="flex gap-2">
                                {["Breakfast", "Lunch", "Dinner"].map(tab => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === tab
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item, index) => (
                                    <div key={index} className="bg-white border border-gray-100 rounded-xl p-3 flex gap-4 hover:shadow-lg hover:border-orange-100 transition-all duration-300 group">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                            <img
                                                src={getImageUrl(item.image) || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                style={{ minHeight: '6rem', minWidth: '6rem' }}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description || "Deeply flavorful dish prepared with fresh ingredients."}</p>
                                            </div>
                                            <div className="font-bold text-[#ff5e00] text-sm mt-2">
                                                ₹{item.price}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <ChefHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">No items in {activeTab}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="pt-6 mt-8 border-t border-gray-100">
                        <div className="flex items-start gap-3 p-5 bg-orange-50 rounded-xl mb-4 border border-orange-100/50">
                            <input
                                type="checkbox"
                                {...register("termsAccepted")}
                                id="terms"
                                className="mt-1 w-4 h-4 accent-[#ff5e00] cursor-pointer"
                            />
                            <div>
                                <label htmlFor="terms" className="text-sm text-gray-700 font-medium cursor-pointer leading-tight block">
                                    I confirm that all the information provided is accurate and I grant permission to verify my business details.
                                </label>
                                {errors.termsAccepted && <p className="text-red-500 text-xs mt-1 font-bold">{errors.termsAccepted.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default Step5Review;
