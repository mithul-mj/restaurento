import { useFormContext } from "react-hook-form";
import { Upload, MapPin, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";

const Step2Seating = () => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    // We'll manage files in local state for better UX, then sync to useForm
    const currentImages = watch("images") || [];
    const [previewFiles, setPreviewFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        // combine with existing
        const newFiles = [...(currentImages || []), ...acceptedFiles];
        setValue("images", newFiles, { shouldValidate: true });

        // Generate previews
        const newPreviews = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setPreviewFiles(prev => [...prev, ...newPreviews]);

    }, [currentImages, setValue]);

    const removeFile = (e, indexToRemove) => {
        e.stopPropagation(); // prevent opening dropzone
        const newFiles = (currentImages || []).filter((_, index) => index !== indexToRemove);
        setValue("images", newFiles, { shouldValidate: true });

        setPreviewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        }
    });

    useEffect(() => {
        // Cleanup previews
        return () => previewFiles.forEach(file => URL.revokeObjectURL(file.preview));
    }, [previewFiles]);


    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Seating & Photos</h2>
                <p className="text-gray-500 text-sm">Step 2: Capacity and Visuals</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Seating Capacity</label>
                    <input
                        {...register("totalSeats")}
                        type="number"
                        className={`w-full p-3 rounded-lg border ${errors.totalSeats ? 'border-red-500' : 'border-gray-200 focus:border-[#ff5e00]'} outline-none`}
                        placeholder="e.g. 50"
                    />
                    {errors.totalSeats && <p className="text-red-500 text-sm mt-1">{errors.totalSeats.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            {...register("address")}
                            className={`w-full p-3 pl-10 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-[#ff5e00]'} outline-none`}
                            placeholder="Full restaurant address"
                        />
                    </div>
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Photos</label>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer group 
                            ${isDragActive ? 'border-[#ff5e00] bg-orange-50' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-100 transition-colors">
                            <Upload className="text-[#ff5e00]" size={28} />
                        </div>
                        <p className="font-semibold text-gray-700">
                            {isDragActive ? "Drop files here..." : "Click or drag images here"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Upload at least 3 high-quality photos (JPG, PNG, WebP)
                        </p>
                    </div>

                    {/* Previews */}
                    {currentImages?.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {Array.from(currentImages).map((file, i) => (
                                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
                                    {file.preview ? (
                                        <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs break-all p-2">
                                            {file.name}
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => removeFile(e, i)}
                                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white hover:shadow opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step2Seating;
