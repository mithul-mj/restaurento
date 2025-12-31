import { useFormContext } from "react-hook-form";
import { FileText, ShieldCheck, CheckCircle } from "lucide-react";

const Step3Legal = () => {
    const { register, watch, formState: { errors } } = useFormContext();
    const businessCert = watch("businessCert");
    const fssaiCert = watch("fssaiCert");

    const getFileName = (fileList) => {
        if (fileList && fileList.length > 0) {
            return fileList[0].name;
        }
        return "Upload PDF or JPG";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Legal & Verification</h2>
                <p className="text-gray-500 text-sm">Step 3: Verify your business</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">FSSAI License Number</label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            {...register("licenseNumber")}
                            className={`w-full p-3 pl-10 rounded-lg border ${errors.licenseNumber ? 'border-red-500' : 'border-gray-200 focus:border-[#ff5e00]'} outline-none`}
                            placeholder="e.g. 12345678901234"
                        />
                    </div>
                    {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Business Registration Cert */}
                    <label className={`border border-dashed rounded-lg p-6 transition-all text-center group cursor-pointer ${businessCert?.length > 0 ? 'border-[#ff5e00] bg-orange-50' : 'border-gray-300 bg-gray-50 hover:bg-white'}`}>
                        {businessCert?.length > 0 ? (
                            <CheckCircle className="mx-auto text-[#ff5e00] mb-2" size={32} />
                        ) : (
                            <FileText className="mx-auto text-gray-400 group-hover:text-[#ff5e00] mb-2" size={32} />
                        )}
                        <p className="font-semibold text-sm mb-1">Business Registration</p>
                        <p className={`text-xs block truncate px-2 ${businessCert?.length > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {getFileName(businessCert)}
                        </p>
                        <input type="file" {...register("businessCert")} className="hidden" />
                        {errors.businessCert && <p className="text-red-500 text-xs mt-1">{errors.businessCert.message}</p>}
                    </label>

                    {/* FSSAI Cert */}
                    <label className={`border border-dashed rounded-lg p-6 transition-all text-center group cursor-pointer ${fssaiCert?.length > 0 ? 'border-[#ff5e00] bg-orange-50' : 'border-gray-300 bg-gray-50 hover:bg-white'}`}>
                        {fssaiCert?.length > 0 ? (
                            <CheckCircle className="mx-auto text-[#ff5e00] mb-2" size={32} />
                        ) : (
                            <FileText className="mx-auto text-gray-400 group-hover:text-[#ff5e00] mb-2" size={32} />
                        )}
                        <p className="font-semibold text-sm mb-1">FSSAI Certificate</p>
                        <p className={`text-xs block truncate px-2 ${fssaiCert?.length > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {getFileName(fssaiCert)}
                        </p>
                        <input type="file" {...register("fssaiCert")} className="hidden" />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Step3Legal;
