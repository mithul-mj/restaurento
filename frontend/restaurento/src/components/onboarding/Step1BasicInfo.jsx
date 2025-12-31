import { useFormContext, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { X, Clock } from 'lucide-react';

const Step1BasicInfo = () => {
    const { register, control, watch, setValue, formState: { errors } } = useFormContext();
    const { fields } = useFieldArray({
        control,
        name: "openingHours.slots"
    });

    const tags = watch("tags") || [];
    const [tagInput, setTagInput] = useState("");

    const addTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setValue("tags", [...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setValue("tags", tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Restaurant Details</h2>
                <p className="text-gray-500 text-sm">Step 1: Tell us about your place</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Name</label>
                        <input
                            {...register("restaurantName")}
                            className={`w-full p-3 rounded-lg border ${errors.restaurantName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#ff5e00]'} outline-none transition-colors`}
                            placeholder="e.g. The Golden Spoon"
                        />
                        {errors.restaurantName && <p className="text-red-500 text-xs mt-1">{errors.restaurantName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Business Phone</label>
                        <input
                            {...register("restaurantPhone")}
                            className={`w-full p-3 rounded-lg border ${errors.restaurantPhone ? 'border-red-500' : 'border-gray-200 focus:border-[#ff5e00]'} outline-none transition-colors`}
                            placeholder="+1 234 567 890"
                        />
                        {errors.restaurantPhone && <p className="text-red-500 text-xs mt-1">{errors.restaurantPhone.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                        {...register("description")}
                        rows={3}
                        className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#ff5e00] resize-none"
                        placeholder="Describe what makes your restaurant special..."
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisines / Tags</label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {tags.map(tag => (
                            <span key={tag} className="bg-[#ff5e00]/10 text-[#ff5e00] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14} /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
                            className="flex-1 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#ff5e00]"
                            placeholder="Add generic tags e.g. Italian, Vegan..."
                        />
                        <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200">Add</button>
                    </div>
                    {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>}
                </div>

                <div className="pt-4 border-t">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock size={18} /> Opening Hours</h3>
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <span className="w-24 font-medium text-gray-700">{field.day}</span>
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`flex items-center gap-2 flex-1 ${watch(`openingHours.slots.${index}.isClosed`) ? 'opacity-40 pointer-events-none' : ''}`}>
                                        <input type="time" {...register(`openingHours.slots.${index}.open`)} className="p-2 border rounded" />
                                        <span className="text-gray-400">to</span>
                                        <input type="time" {...register(`openingHours.slots.${index}.close`)} className="p-2 border rounded" />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input type="checkbox" {...register(`openingHours.slots.${index}.isClosed`)} className="w-4 h-4 accent-[#ff5e00]" />
                                        Closed
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step1BasicInfo;