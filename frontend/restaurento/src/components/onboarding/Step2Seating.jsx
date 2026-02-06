import { useFormContext } from "react-hook-form";
import MultiImageUpload from "../common/MultiImageUpload";

const Step2Seating = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Restaurant Details</h2>
                <p className="text-gray-500 mt-2">Step 2: Seating & Photos</p>
            </div>

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
