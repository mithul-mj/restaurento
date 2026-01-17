import { useFormContext } from "react-hook-form";
import { Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

const Step2Seating = () => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const currentImages = watch("images") || [];

    const onDrop = useCallback(async (acceptedFiles) => {
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

        const combined = [...(currentImages || []), ...filesWithPreview];
        const newFiles = combined.slice(0, 5);
        setValue("images", newFiles, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }, [currentImages, setValue]);

    const removeFile = (e, indexToRemove) => {
        e.stopPropagation();
        const newFiles = (currentImages || []).filter((_, index) => index !== indexToRemove);
        setValue("images", newFiles, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 5
    });

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

                    <div
                        {...getRootProps()}
                        className={`block border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group relative ${isDragActive ? 'border-[#ff5e00] bg-orange-50/30' : 'border-gray-200 bg-[#FFFBF7] hover:bg-orange-50/30'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="mb-4">
                            <Upload className="mx-auto text-gray-400 group-hover:text-[#ff5e00] transition-colors" size={40} />
                        </div>
                        <p className="font-bold text-gray-800 mb-2">Drag & drop your photos here</p>
                        <p className="text-sm text-gray-500 mb-6">or</p>
                        <button type="button" className="px-6 py-2.5 bg-[#FFF0E5] text-[#ff5e00] font-bold rounded-lg group-hover:bg-[#ff5e00] group-hover:text-white transition-all">
                            Browse Files
                        </button>
                    </div>

                    {currentImages?.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {Array.from(currentImages).map((file, i) => (
                                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group">
                                    {file.preview || (typeof file === 'string') ? (
                                        <img src={file.preview || file} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs break-all p-2">
                                            {file.name || "Image"}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={(e) => removeFile(e, i)} type="button" className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.images && <p className="text-red-500 text-xs mt-1 font-medium">{errors.images.message}</p>}
                </div>
            </div>
        </div>

    );
};

export default Step2Seating;
