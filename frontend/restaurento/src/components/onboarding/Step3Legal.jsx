import { useFormContext } from "react-hook-form";
import FileUploadCard from "../common/FileUploadCard";

const Step3Legal = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Legal & Verification Documents</h2>
                <p className="text-gray-500 mt-2">Please upload the following documents to verify your business.</p>
            </div>

            <div className="space-y-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 space-y-8">
                    <h3 className="font-bold text-lg text-gray-800 border-b pb-4">Upload Legal Documents</h3>



                    <FileUploadCard
                        name="restaurantLicense"
                        label="Restaurant License"
                        required
                    />

                    <FileUploadCard
                        name="businessCert"
                        label="Business Registration Certificate"
                        required
                    />

                    <FileUploadCard
                        name="fssaiCert"
                        label="FSSAI License Certificate"
                        required
                    />

                    <FileUploadCard
                        name="ownerIdCert"
                        label="Owner's ID Proof"
                        required
                    />
                </div>
            </div>
        </div>
    );
};

export default Step3Legal;
