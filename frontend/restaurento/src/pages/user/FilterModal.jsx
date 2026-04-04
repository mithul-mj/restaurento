import { useState, useEffect } from "react";
import { X, Filter, RotateCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

const FilterModal = ({ isOpen, onClose, onApply, filters, hasLocation }) => {
    const [activeTab, setActiveTab] = useState("sort");
    const dragControls = useDragControls();

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

    const handleClearAll = () => {
        reset({ sort: "rating_high_low", rating: "Any", cost: [] });
    };

    const renderSidebar = () => (
        <div className="w-1/3 bg-gray-50 border-r border-gray-100 py-2 h-full">
            {[
                { id: "sort", label: "Sort by" },
                { id: "rating", label: "Rating" },
                { id: "cost", label: "Price" },
            ].map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-6 py-5 text-sm font-semibold transition-all
            ${activeTab === tab.id
                            ? "bg-white text-[#ff5e00] border-l-4 border-[#ff9500]"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-l-4 border-transparent"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );

    const renderContent = () => (
        <div className="flex-1 p-6 overflow-y-auto h-full scrollbar-hide">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-6">
                {activeTab === "sort" && "Choose Sorting Option"}
                {activeTab === "rating" && "Minimum Rating"}
                {activeTab === "cost" && "Price Range"}
            </h4>

            <div className="space-y-5">
                {activeTab === "sort" && (
                    <div className="flex flex-col gap-4">
                        {hasLocation && (
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input
                                    type="radio"
                                    value="distance"
                                    {...register("sort")}
                                    className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                                />
                                <span className="text-gray-700 font-medium group-hover:text-black transition-colors">Distance: Nearest First</span>
                            </label>
                        )}
                        {[
                            { value: "rating_high_low", label: "Rating: High to Low" },
                            { value: "cost_low_high", label: "Price: Low to High" },
                            { value: "cost_high_low", label: "Price: High to Low" },
                        ].map((opt) => (
                            <label key={opt.value} className="flex items-center gap-4 cursor-pointer group">
                                <input
                                    type="radio"
                                    value={opt.value}
                                    {...register("sort")}
                                    className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                                />
                                <span className="text-gray-700 font-medium group-hover:text-black transition-colors">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                )}

                {activeTab === "rating" && (
                    <div className="flex flex-col gap-4">
                        {[
                            { value: "Any", label: "Any Rating" },
                            { value: "3.5+", label: "Rating 3.5+" },
                            { value: "4.0+", label: "Rating 4.0+" },
                            { value: "4.5+", label: "Rating 4.5+" },
                        ].map((opt) => (
                            <label key={opt.value} className="flex items-center gap-4 cursor-pointer group">
                                <input
                                    type="radio"
                                    value={opt.value}
                                    {...register("rating")}
                                    className="w-5 h-5 accent-[#ff9500] cursor-pointer"
                                />
                                <span className="text-gray-700 font-medium group-hover:text-black transition-colors">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                )}

                {activeTab === "cost" && (
                    <div className="flex flex-col gap-4">
                        {[
                            "100-200", "200-300", "300-400", "400-500", "500+"
                        ].map((range) => (
                            <label key={range} className="flex items-center gap-4 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    value={range}
                                    {...register("cost")}
                                    className="w-5 h-5 accent-[#ff9500] cursor-pointer rounded-md"
                                />
                                <span className="text-gray-700 font-medium group-hover:text-black transition-colors">
                                    {range === "500+" ? "₹500+" : `₹${range.split('-')[0]} - ₹${range.split('-')[1]}`}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex flex-col md:items-center md:justify-center p-0 md:p-4 mt-0">
                    {/* Unified Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] md:bg-black/50 md:backdrop-blur-sm"
                    />

                    {/* Unified Responsive Container */}
                    <motion.div
                        drag={window.innerWidth < 768 ? "y" : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        dragControls={dragControls}
                        dragListener={false}
                        initial={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                        animate={window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }}
                        exit={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white md:rounded-[2.5rem] rounded-t-[2.5rem] w-full md:max-w-xl h-[85vh] md:h-[550px] overflow-hidden shadow-2xl relative z-10 flex flex-col mt-auto md:mt-0"
                    >
                        {/* Mobile Pull Handle */}
                        <div
                            className="md:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => dragControls.start(e)}
                        />

                        {/* Modal Header */}
                        <div
                            className="flex items-center justify-between px-8 py-4 md:py-6 border-b border-gray-50 shrink-0"
                            onPointerDown={window.innerWidth < 768 ? (e) => dragControls.start(e) : undefined}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-[#ff9500] rounded-xl hidden md:block">
                                    <Filter size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                                    {window.innerWidth < 768 ? "Filters" : "Search Filters"}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-gray-100 p-2 md:p-2.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Main Interaction Logic (Single set of inputs) */}
                        <form
                            className="flex-1 flex flex-col overflow-hidden"
                            onSubmit={handleSubmit((data) => {
                                onApply(data);
                                onClose();
                            })}
                        >
                            <div className="flex w-full overflow-hidden flex-1">
                                {renderSidebar()}
                                {renderContent()}
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-gray-100 flex justify-between items-center bg-white shrink-0 pb-10 md:pb-5">
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-500 font-bold text-[13px] hover:text-[#ff5e00] transition-colors"
                                >
                                    <RotateCcw size={14} />
                                    Clear all
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 md:px-10 py-3 md:py-3.5 bg-[#ff9500] hover:bg-[#e08400] text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-orange-100 active:scale-95"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FilterModal;
