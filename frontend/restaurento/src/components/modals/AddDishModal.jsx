import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { menuSchema } from '../../schemas/menuSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import FileUploadCard from '../common/FileUploadCard';

const AddDishModal = ({ onClose, onSave, initialData }) => {
    const methods = useForm({
        resolver: zodResolver(menuSchema),
        defaultValues: {
            name: "",
            price: "",
            description: "",
            image: null,
            categories: ["Breakfast"]
        }
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = methods;

    const categories = watch('categories') || [];

    useEffect(() => {
        if (initialData) {
            const formatImage = (img) => {
                if (!img) return null;
                return typeof img === 'string' ? { preview: img } : img;
            };

            const existingImage = formatImage(initialData.image);

            reset({
                ...initialData,
                image: existingImage,
                categories: Array.isArray(initialData.categories)
                    ? initialData.categories
                    : [initialData.category || "Breakfast"]
            });
        } else {
            reset({
                name: "",
                price: "",
                description: "",
                image: null,
                categories: []
            });
        }
    }, [initialData, reset]);

    const handleCategoryChange = (category) => {
        const current = categories;
        let newCategories;
        if (current.includes(category)) {
            newCategories = current.filter(c => c !== category);
        } else {
            newCategories = [...current, category];
        }
        setValue('categories', newCategories, { shouldValidate: true });
    };

    const onSubmit = (data) => {
        const finalData = {
            ...data,
            category: data.categories?.[0] || "Breakfast",
            categories: data.categories
        };

        onSave(finalData);
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-900 w-full text-center">
                        {initialData ? 'Edit Dish' : 'Add New Dish to Your Menu'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Dish Name</label>
                                    <input
                                        {...register("name")}
                                        className="w-full p-3.5 rounded-xl border border-gray-200 outline-none focus:border-[#ff5e00] text-gray-700 bg-white placeholder:text-gray-400"
                                        placeholder="e.g. Classic Margherita Pizza"
                                    />
                                    {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-gray-400 font-medium">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register("price")}
                                            className="w-full p-3.5 pl-8 rounded-xl border border-gray-200 outline-none focus:border-[#ff5e00] text-gray-700 bg-white placeholder:text-gray-300"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.price && <span className="text-red-500 text-xs mt-1">{errors.price.message}</span>}
                                </div>
                            </div>

                            <div>
                                <FileUploadCard
                                    name="image"
                                    label="Dish Image"
                                    required={true}
                                    aspectRatio={1} // Square crop for dishes
                                    acceptedFileTypes={{ 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] }} // Strictly images
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1.5">Description</label>
                            <textarea
                                rows={3}
                                {...register("description")}
                                className="w-full p-3.5 rounded-xl border border-gray-200 outline-none focus:border-[#ff5e00] text-gray-700 bg-white placeholder:text-gray-400 resize-none"
                                placeholder="e.g., Fresh basil, mozzarella, san marzano tomatoes on a hand-tossed crust."
                            />
                            {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-3">Available During</label>
                            <div className="flex gap-6">
                                {["Breakfast", "Lunch", "Dinner"].map((type) => (
                                    <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${categories.includes(type) ? 'bg-[#ff5e00] border-[#ff5e00]' : 'border-gray-300 bg-white group-hover:border-[#ff5e00]'} `}>
                                            {categories.includes(type) && <Check className="text-white" size={14} strokeWidth={3} />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={categories.includes(type)}
                                            onChange={() => handleCategoryChange(type)}
                                        />
                                        <span className="text-gray-700 font-medium">{type}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.categories && <span className="text-red-500 text-xs mt-1">{errors.categories.message}</span>}
                        </div>

                        <div className="p-6 border-t bg-white flex justify-end gap-3 mt-4 -mx-8 -mb-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-2.5 bg-[#ff5e00] text-white font-bold rounded-lg hover:bg-[#e05200] transition-colors shadow-lg shadow-orange-100 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );

    return createPortal(modalContent, document.getElementById('modal-root') || document.body);
};

export default AddDishModal;
``
