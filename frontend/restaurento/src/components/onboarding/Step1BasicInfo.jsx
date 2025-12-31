import { useFormContext } from 'react-hook-form';

const Step1BasicInfo = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Restaurant Details</h2>
                <p className="text-gray-500 text-sm">Step 1: Basic Information</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Name</label>
                    <input
                        {...register("restaurantName")}
                        className={`w-full p-3 rounded-lg border ${errors.restaurantName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#ff5e00]'} outline-none`}
                        placeholder="e.g. The Golden Spoon"
                    />
                    {errors.restaurantName && <p className="text-red-500 text-xs mt-1">{errors.restaurantName.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Business Phone</label>
                    <input
                        {...register("restaurantPhone")}
                        className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#ff5e00]"
                        placeholder="+1 234 567 890"
                    />
                    {errors.restaurantPhone && <p className="text-red-500 text-xs mt-1">{errors.restaurantPhone.message}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step1BasicInfo;