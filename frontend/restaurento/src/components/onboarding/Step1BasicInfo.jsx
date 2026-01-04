import { useFormContext, useFieldArray } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { X, Clock, Settings } from 'lucide-react';
import EditSlotsModal from '../modals/EditSlotsModal';
import { calculateSlots } from '../../utils/slotGenerator';

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Step1BasicInfo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, control, watch, setValue, getValues, formState: { errors } } = useFormContext();

    const { fields } = useFieldArray({
        control,
        name: "openingHours.days"
    });

    const tags = watch("tags") || [];
    const isSameEveryDay = watch("openingHours.isSameEveryDay");
    const days = watch("openingHours.days");
    const duration = watch("slotConfig.duration");
    const gap = watch("slotConfig.gap");

    const [tagInput, setTagInput] = useState("");

    const addTag = (e) => {
        e.preventDefault();
        const MAX_TAGS = 5;
        if (tags.length >= MAX_TAGS) {
            return;
        }
        if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
            setValue("tags", [...tags, tagInput.trim().toLowerCase()]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setValue("tags", tags.filter(tag => tag !== tagToRemove));
    };

    const updateSlotsForDay = (dayIndex, currentDays, currentDuration, currentGap) => {
        const day = currentDays[dayIndex];
        if (!day.isClosed && day.startTime && day.endTime) {
            const newSlots = calculateSlots(day.startTime, day.endTime, currentDuration, currentGap);
            setValue(`openingHours.days.${dayIndex}.generatedSlots`, newSlots);
            return newSlots;
        }
        return [];
    };

    const handleTimeBlur = (index) => {
        const currentDays = getValues("openingHours.days");
        const currentDuration = getValues("slotConfig.duration");
        const currentGap = getValues("slotConfig.gap");
        const isSame = getValues("openingHours.isSameEveryDay");

        const newSlots = updateSlotsForDay(index, currentDays, currentDuration, currentGap);

        // Propagate if Same Every Day
        if (isSame && index === 0) {
            const masterDay = currentDays[0];
            for (let i = 1; i < currentDays.length; i++) {
                setValue(`openingHours.days.${i}.startTime`, masterDay.startTime);
                setValue(`openingHours.days.${i}.endTime`, masterDay.endTime);
                setValue(`openingHours.days.${i}.isClosed`, false);
                setValue(`openingHours.days.${i}.generatedSlots`, newSlots);
            }
        }
    };

    useEffect(() => {
        if (!days || !duration) return;

        days.forEach((day, index) => {
            if (!day.isClosed && day.startTime && day.endTime) {
                const newSlots = calculateSlots(day.startTime, day.endTime, duration, gap);
                if (JSON.stringify(newSlots) !== JSON.stringify(day.generatedSlots)) {
                    setValue(`openingHours.days.${index}.generatedSlots`, newSlots);
                }
            }
        });

        if (isSameEveryDay && days[0]) {
            if (days[0].isClosed) {
                setValue("openingHours.days.0.isClosed", false);
                if (!days[0].startTime) setValue("openingHours.days.0.startTime", "09:00");
                if (!days[0].endTime) setValue("openingHours.days.0.endTime", "22:00");
            }

            handleTimeBlur(0);
        }
    }, [duration, gap, isSameEveryDay]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tell us about your restaurant</h2>
                <p className="text-gray-500 mt-2">Let's start with the basics to get your page set up.</p>
            </div>

            <div className="space-y-6">

                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Restaurant Name</label>
                    <input
                        {...register("restaurantName")}
                        className="w-full p-4 rounded-xl bg-[#FFFBF7] border border-orange-100 focus:bg-white focus:border-[#ff5e00] outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. The Cozy Italian Corner"
                    />
                    {errors.restaurantName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.restaurantName.message}</p>}
                </div>


                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Restaurant Description</label>
                    <textarea
                        {...register("description")}
                        rows={4}
                        className="w-full p-4 rounded-xl bg-[#FFFBF7] border border-orange-100 focus:bg-white focus:border-[#ff5e00] outline-none transition-all resize-none placeholder:text-gray-400"
                        placeholder="Describe what makes your restaurant special. Max 500 characters."
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
                </div>


                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Restaurant Phone No</label>
                    <input
                        {...register("restaurantPhone")}
                        className="w-full p-4 rounded-xl bg-[#FFFBF7] border border-orange-100 focus:bg-white focus:border-[#ff5e00] outline-none transition-all placeholder:text-gray-400"
                        placeholder="+1 234 567 890"
                    />
                    {errors.restaurantPhone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.restaurantPhone.message}</p>}
                </div>


                <div className="p-1">
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                        Tags(s) {tags.length > 0 && <span className="text-gray-500 font-normal">({tags.length}/5)</span>}
                    </label>
                    <div className="flex gap-2">
                        <input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
                            disabled={tags.length >= 5}
                            className="flex-1 p-4 rounded-xl bg-[#FFFBF7] border border-orange-100 focus:bg-white focus:border-[#ff5e00] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder={tags.length >= 5 ? "Maximum 5 tags reached" : "Add cuisines..."}
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            disabled={tags.length >= 5}
                            className="px-6 rounded-xl bg-[#ff5e00] text-white font-bold hover:bg-[#e05200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ff5e00]"
                        >
                            Add
                        </button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {tags.map(tag => (
                                <span key={tag} className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 border border-gray-200">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 text-gray-400"><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                    )}
                    {errors.tags && <p className="text-red-500 text-xs mt-1 font-medium">{errors.tags.message}</p>}
                </div>


                <div className="border border-orange-100 rounded-2xl p-6 bg-[#FFFBF7]">
                    <h3 className="font-bold text-gray-800 mb-2">Opening Hours</h3>
                    <div className="flex items-center gap-3 mb-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register("openingHours.isSameEveryDay")} className="sr-only" />
                            <div className={`w-11 h-6 transition-all rounded-full relative ${isSameEveryDay ? 'bg-[#ff5e00]' : 'bg-gray-200'} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isSameEveryDay ? 'after:translate-x-full after:border-white' : ''}`}></div>
                        </label>
                        <span className="text-sm font-bold text-gray-700">Same hours every day</span>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => {
                            if (isSameEveryDay && index > 0) return null;

                            return (
                                <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-4 py-2 border-b border-orange-100 last:border-0">
                                    <div className="flex items-center gap-3 md:w-32">
                                        {!isSameEveryDay && (
                                            <input type="checkbox" {...register(`openingHours.days.${index}.isClosed`)} className="w-5 h-5 accent-[#ff5e00] rounded" />
                                        )}
                                        <span className={`font-bold ${isSameEveryDay ? 'text-[#ff5e00]' : 'text-gray-700'}`}>
                                            {isSameEveryDay ? 'Every Day' : DAY_NAMES[index]}
                                        </span>
                                    </div>

                                    <div className={`flex items-center gap-4 flex-1 transition-opacity ${watch(`openingHours.days.${index}.isClosed`) ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                        <div className="flex-1 relative">
                                            <input type="time" {...register(`openingHours.days.${index}.startTime`, { onBlur: () => handleTimeBlur(index) })} className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#ff5e00] font-medium text-gray-600" />
                                            <Clock className="absolute right-3 top-3.5 text-gray-300 pointer-events-none" size={16} />
                                        </div>
                                        <span className="text-gray-400 font-medium">to</span>
                                        <div className="flex-1 relative">
                                            <input type="time" {...register(`openingHours.days.${index}.endTime`, { onBlur: () => handleTimeBlur(index) })} className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#ff5e00] font-medium text-gray-600" />
                                            <Clock className="absolute right-3 top-3.5 text-gray-300 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    {watch(`openingHours.days.${index}.isClosed`) && <span className="text-red-500 font-bold text-sm ml-2">Closed</span>}
                                </div>
                            )
                        })}
                    </div>
                    {errors.openingHours?.days && <p className="text-red-500 text-xs mt-2 font-medium">{errors.openingHours.days.message}</p>}
                </div>


                <div className="border border-orange-100 rounded-2xl p-6 bg-[#FFFBF7]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Slot Duration</label>
                            <select {...register("slotConfig.duration")} className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#ff5e00] font-medium">
                                <option value="30">30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">60 minutes</option>
                                <option value="90">90 minutes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Slots Gap</label>
                            <select {...register("slotConfig.gap")} className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#ff5e00] font-medium">
                                <option value="0">0 minutes</option>
                                <option value="5">5 minutes</option>
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-100">
                        <div className="flex items-center gap-2 text-[#ff5e00] text-sm font-bold">
                            <Settings size={18} />
                            <span>Slots will be automatically generated and updated.</span>
                        </div>
                        <button type="button" onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition-colors">
                            View & Edit slots
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <EditSlotsModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
};

export default Step1BasicInfo;