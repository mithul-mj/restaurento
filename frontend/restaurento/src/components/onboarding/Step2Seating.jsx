import { useFormContext } from "react-hook-form";
import MultiImageUpload from "../common/MultiImageUpload";

const Step2Seating = ({ isEditing = false }) => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            {!isEditing && (
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Restaurant Details</h2>
                    <p className="text-gray-500 mt-2">Step 2: Seating & Photos & Rates</p>
                </div>
            )}


            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Seating Capacity</h3>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Total Seats</label>
                    <input
                        {...register("totalSeats")}
                        type="number"
                        className="w-full md:w-1/3 p-4 rounded-xl bg-[#FFFBF7] border border-orange-100 focus:bg-white focus:border-[#ff5e00] outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. 50"
                    />
                    {errors.totalSeats && <p className="text-red-500 text-xs mt-1 font-medium">{errors.totalSeats.message}</p>}
                </div>

                <div className="border border-orange-100 rounded-2xl p-6 bg-[#FFFBF7]">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Slot Booking Rates</h3>
                    <p className="text-sm text-gray-500 mb-4">Set the price for a customer to book a single slot at your restaurant.</p>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Price Per Person</label>
                        <div className="relative max-w-xs">
                            <span className="absolute left-3 top-3 text-gray-500 font-bold">₹</span>
                            <input
                                {...register("slotPrice")}
                                type="number"
                                className="w-full p-3 pl-6 rounded-lg bg-white border border-gray-200 focus:border-[#ff5e00] outline-none font-medium"
                                placeholder="5.00"
                            />
                        </div>
                        {errors.slotPrice && <p className="text-red-500 text-xs mt-1 font-medium">{errors.slotPrice.message}</p>}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Restaurant Photos</h3>
                    <p className="text-sm text-gray-500 mb-4">Upload 3-5 high-quality photos of your restaurant's interior, exterior, and popular dishes.</p>

                    <MultiImageUpload
                        name="images"
                        label="" // Label handled by parent header
                        maxFiles={5}
                        aspectRatio={16 / 9}
                    />
                </div>
            </div>
        </div>

    );
};

export default Step2Seating;
