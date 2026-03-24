import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Edit2, Upload } from "lucide-react";
import { useState } from "react";
import AddDishModal from "../modals/AddDishModal";

const Step4Menu = () => {
    const { register, control, formState: { errors } } = useFormContext();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "menuItems"
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const handleSaveDish = (dishData) => {
        if (editingIndex !== null) {
            update(editingIndex, dishData);
        } else {
            append(dishData);
        }
        setIsModalOpen(false);
        setEditingIndex(null);
    };

    const handleEditClick = (index, item) => {
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleAddNewClick = () => {
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Menu & Slot Rates</h2>
                <p className="text-gray-500 mt-2">Manage your menu items for different times of the day and set your booking prices.</p>
            </div>

            <div className="space-y-8">

                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-lg">Your Menu Items</h3>
                    <button
                        type="button"
                        onClick={handleAddNewClick}
                        className="px-6 py-2 bg-[#ff5e00] text-white font-bold rounded-lg hover:bg-[#e05200] transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} /> Add New Dish
                    </button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {field.image && field.image.preview ? (
                                        <img src={field.image.preview} alt={field.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                            <Upload size={20} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{field.name}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-1">{field.description}</p>
                                    <div className="flex gap-1 mt-1">
                                        {(field.categories || [field.category]).map((cat, i) => (
                                            <span key={i} className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold text-gray-900">₹{field.price}</span>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => handleEditClick(index, field)} className="text-gray-400 hover:text-[#ff5e00] transition-colors"><Edit2 size={16} /></button>
                                    <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div className="text-center py-12 bg-[#FFFBF7] border border-dashed border-orange-200 rounded-2xl">
                            <p className="text-gray-500 font-medium mb-4">No menu items added yet.</p>
                            <button
                                type="button"
                                onClick={handleAddNewClick}
                                className="px-5 py-2 bg-white border border-orange-200 text-[#ff5e00] font-bold rounded-lg hover:bg-orange-50 transition-colors text-sm"
                            >
                                Add Your First Dish
                            </button>
                        </div>
                    )}
                </div>


            </div>

            {isModalOpen && (
                <AddDishModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveDish}
                    initialData={editingIndex !== null ? fields[editingIndex] : null}
                />
            )}
        </div>
    );
};

export default Step4Menu;
