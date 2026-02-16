import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

const FilterModal = ({ isOpen, onClose, onApply, filters, hasLocation }) => {
    const [activeTab, setActiveTab] = useState("sort");

    const { register, handleSubmit, reset } = useForm({
        defaultValues: filters || {
            sort: "rating_high_low",
            rating: "Any",
            cost: [],
        },
    });

    useEffect(() => {
        if (isOpen && filters) {
            reset(filters);
        }
    }, [isOpen, filters, reset]);


    if (!isOpen) return null;

    const renderSidebar = () => (
        <div className="w-1/3 bg-gray-50 border-r border-gray-100 py-2 h-full">
            <button
                type="button"
                onClick={() => setActiveTab("sort")}
                className={`w-full text-left px-6 py-4 text-sm font-medium transition-all
          ${activeTab === "sort"
                        ? "bg-white text-gray-900 border-l-4 border-[#ff9500]"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-l-4 border-transparent"
                    }`}
            >
                Sort by
            </button>

            <button
                type="button"
                onClick={() => setActiveTab("rating")}
                className={`w-full text-left px-6 py-4 text-sm font-medium transition-all
          ${activeTab === "rating"
                        ? "bg-white text-gray-900 border-l-4 border-[#ff9500]"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-l-4 border-transparent"
                    }`}
            >
                Rating
            </button>

            <button
                type="button"
                onClick={() => setActiveTab("cost")}
                className={`w-full text-left px-6 py-4 text-sm font-medium transition-all
          ${activeTab === "cost"
                        ? "bg-white text-gray-900 border-l-4 border-[#ff9500]"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-l-4 border-transparent"
                    }`}
            >
                Price
            </button>
        </div>
    );

    const renderContent = () => (
        <div className="flex-1 p-5 overflow-y-auto h-full">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">
                {activeTab === "sort" && "Sort by"}
                {activeTab === "rating" && "Rating"}
                {activeTab === "cost" && "Price"}
            </h4>

            <div className="space-y-4">
                {/* SORT TAB */}
                {activeTab === "sort" && (
                    <div className="flex flex-col gap-4">
                        {hasLocation && (
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    value="distance"
                                    {...register("sort")}
                                    className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                                />
                                <span className="text-gray-700 font-medium">Distance: Nearest First</span>
                            </label>
                        )}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                value="rating_high_low"
                                {...register("sort")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium">Rating: High to Low</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                value="cost_low_high"
                                {...register("sort")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium">Price: Low to High</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                value="cost_high_low"
                                {...register("sort")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium">Price: High to Low</span>
                        </label>
                    </div>
                )}

                {/* RATING TAB - Normal Radio Buttons */}
                {activeTab === "rating" && (
                    <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                value="Any"
                                {...register("rating")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium">Any Rating</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                value="3.5+"
                                {...register("rating")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium">Rating 3.5+</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                value="4.0+"
                                {...register("rating")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium">Rating 4.0+</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                value="4.5+"
                                {...register("rating")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium">Rating 4.5+</span>
                        </label>
                    </div>
                )}

                {/* PRICE TAB - Normal Checkboxes */}
                {activeTab === "cost" && (
                    <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                value="100-200"
                                {...register("cost")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer rounded"
                            />
                            <span className="text-gray-700 font-medium">₹100 - ₹200</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                value="200-300"
                                {...register("cost")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer rounded"
                            />
                            <span className="text-gray-700 font-medium">₹200 - ₹300</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                value="300-400"
                                {...register("cost")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer rounded"
                            />
                            <span className="text-gray-700 font-medium">₹300 - ₹400</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                value="400-500"
                                {...register("cost")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer rounded"
                            />
                            <span className="text-gray-700 font-medium">₹400 - ₹500</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                value="500+"
                                {...register("cost")}
                                className="w-5 h-5 accent-[#ff9500] cursor-pointer rounded"
                            />
                            <span className="text-gray-700 font-medium">₹500+</span>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col md:max-h-[600px] max-h-[80vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* FORM BODY */}
                <form
                    className="flex flex-col flex-1 overflow-hidden"
                    onSubmit={handleSubmit(onApply)}
                >
                    <div className="flex w-full overflow-hidden h-[290px]">
                        {renderSidebar()}
                        {renderContent()}
                    </div>

                    {/* FOOTER */}
                    <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-3 bg-white">
                        <button
                            type="button"
                            onClick={() => reset({ sort: "rating_high_low", rating: "Any", cost: [] })}
                            className="px-6 py-2.5 text-gray-500 font-medium text-sm hover:text-gray-900 transition-colors"
                        >
                            Clear all
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-[#ff9500] hover:bg-[#e08400] text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5"
                        >
                            Apply
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FilterModal;
