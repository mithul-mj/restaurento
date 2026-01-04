import { useFormContext } from "react-hook-form";
import { FileText, CheckCircle, X, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

const FileUploadCard = ({ name, label, required, acceptedFileTypes = { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] } }) => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const files = watch(name);
    const file = files && files.length > 0 ? files[0] : null;

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const filesWithPreview = await Promise.all(
                acceptedFiles.map(async (file) => {
                    const dataUrl = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                    return Object.assign(file, { preview: dataUrl });
                })
            );

            setValue(name, filesWithPreview, { shouldValidate: true });
        }
    }, [name, setValue]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        maxFiles: 1
    });

    const removeFile = (e) => {
        e.stopPropagation();
        setValue(name, null, { shouldValidate: true });
    };

    return (
        <div className="bg-white">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-800 text-sm">
                    {label} {required && <span className="text-red-500">(Required)</span>}
                    {!required && <span className="text-gray-400 font-normal">(Optional)</span>}
                </h4>
            </div>

            {file ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button type="button" onClick={removeFile} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`border border-dashed rounded-xl p-8 text-center transition-all cursor-pointer hover:bg-orange-50/20 ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                >
                    <input {...getInputProps()} />
                    <p className="text-xs text-gray-400 mb-4">Supports: PDF, JPG, PNG. Max size: 5MB</p>
                    <span className="px-5 py-2 bg-[#FFF0E5] text-[#ff5e00] font-bold rounded-lg text-sm">
                        Drag & Drop or Click to Upload
                    </span>
                </div>
            )}
            {errors[name] && <p className="text-red-500 text-xs mt-2 font-medium">{errors[name].message}</p>}
        </div>
    )
}

const Step3Legal = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Legal & Verification Documents</h2>
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
