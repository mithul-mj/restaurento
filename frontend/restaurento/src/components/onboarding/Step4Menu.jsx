import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2, Image as ImageIcon, DollarSign, CheckCircle } from "lucide-react";

const MenuItem = ({ index, remove, register, control }) => {
    const image = useWatch({
        control,
        name: `menuItems.${index}.image`
    });

    return (
        <div className="group relative bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-orange-200 transition-all">
            <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
            >
                <Trash2 size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Image Placeholder */}
                <div className="md:col-span-2">
                    <label className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-colors block border-2 border-dashed ${image?.length > 0 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-200 hover:bg-gray-300'}`}>
                        {image?.length > 0 ? (
                            <CheckCircle className="text-green-500" />
                        ) : (
                            <ImageIcon className="text-gray-400" />
                        )}
                        <input type="file" className="hidden" {...register(`menuItems.${index}.image`)} />
                    </label>
                </div>

                <div className="md:col-span-10 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            {...register(`menuItems.${index}.name`)}
                            placeholder="Dish Name (e.g. Margherita Pizza)"
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#ff5e00]"
                        />
                        <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 text-gray-400" size={16} />
                            <input
                                {...register(`menuItems.${index}.price`)}
                                placeholder="Price"
                                type="number"
                                className="w-full p-2 pl-8 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#ff5e00]"
                            />
                        </div>
                    </div>
                    <textarea
                        {...register(`menuItems.${index}.description`)}
                        placeholder="Short description of the dish..."
                        rows={2}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#ff5e00] resize-none text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

const Step4Menu = () => {
    const { register, control, formState: { errors } } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "menuItems"
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Menu & Slot Rates</h2>
                <p className="text-gray-500 text-sm">Step 4: Configure your offerings</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Manage Your Menu</h3>
                    <button
                        type="button"
                        onClick={() => append({ name: "", price: "", description: "" })}
                        className="flex items-center gap-2 text-[#ff5e00] font-semibold hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Plus size={18} /> Add Item
                    </button>
                </div>

                <div className="space-y-6">
                    {fields.length === 0 && (
                        <p className="text-center text-gray-400 py-8 italic">No items added yet. Click "Add Item" to start.</p>
                    )}
                    {fields.map((field, index) => (
                        <MenuItem key={field.id} index={index} remove={remove} register={register} control={control} />
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
                <h3 className="font-bold text-lg mb-4">Slot Booking Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Price Per Person</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-bold">$</span>
                            <input
                                {...register("slotPrice")}
                                type="number"
                                className="w-full p-3 pl-8 rounded-lg border border-gray-200 outline-none focus:border-[#ff5e00]"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">This is the base price for booking a slot.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step4Menu;
