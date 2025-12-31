import { useFormContext } from "react-hook-form";
import { CheckCircle } from "lucide-react";

const Step5Review = () => {
    const { watch, register, formState: { errors } } = useFormContext();
    const values = watch();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Final Review</h2>
                <p className="text-gray-500 text-sm">Step 5: Confirm details and finish</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Info</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium text-gray-700">Name:</span> {values.restaurantName}</p>
                            <p><span className="font-medium text-gray-700">Phone:</span> {values.restaurantPhone}</p>
                            <p><span className="font-medium text-gray-700">Address:</span> {values.address}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Operations</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium text-gray-700">Capacity:</span> {values.totalSeats} seats</p>
                            <p><span className="font-medium text-gray-700">Slot Price:</span> ${values.slotPrice}</p>
                            <p><span className="font-medium text-gray-700">Menu Items:</span> {values.menuItems?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Legal</h3>
                    <p><span className="font-medium text-gray-700">License #:</span> {values.licenseNumber}</p>
                </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg flex items-start gap-3">
                <input
                    type="checkbox"
                    {...register("termsAccepted")}
                    id="terms"
                    className="mt-1 w-5 h-5 accent-[#ff5e00] cursor-pointer"
                />
                <div>
                    <label htmlFor="terms" className="text-sm text-gray-800 font-medium cursor-pointer">
                        I confirm that all the information provided is accurate and I grant permission to verify my business details.
                    </label>
                    {errors.termsAccepted && <p className="text-red-500 text-xs mt-1 font-bold">{errors.termsAccepted.message}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step5Review;
