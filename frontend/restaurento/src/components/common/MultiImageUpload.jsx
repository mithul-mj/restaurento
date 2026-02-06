import React, { useCallback, useState } from 'react';
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import ImageCropper from './ImageCropper';

const MultiImageUpload = ({
    name,
    label,
    required,
    maxFiles = 5,
    aspectRatio = 16 / 9
}) => {
    const { watch, setValue, formState: { errors } } = useFormContext();
    const existingFiles = watch(name) || [];

    // Queue state
    const [imageToCrop, setImageToCrop] = useState(null);
    const [pendingFiles, setPendingFiles] = useState([]);

    const onDrop = useCallback(async (acceptedFiles) => {
        // Calculate how many we can add
        const remainingSlots = maxFiles - existingFiles.length;
        if (remainingSlots <= 0) return;

        // Take only what fits
        const filesToProcess = acceptedFiles.slice(0, remainingSlots);

        // Standardize file objects (add preview)
        const standardizedFiles = await Promise.all(
            filesToProcess.map(async (file) => {
                const dataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
                return Object.assign(file, { preview: dataUrl });
            })
        );

        // Separate images from others
        const images = standardizedFiles.filter(f =>
            f.type.startsWith('image/') || (typeof f.preview === 'string' && f.preview.startsWith('data:image'))
        );
        const others = standardizedFiles.filter(f => !images.includes(f));

        // Add non-image files immediately
        if (others.length > 0) {
            setValue(name, [...existingFiles, ...others], { shouldValidate: true });
        }

        // Begin cropping process for images
        if (images.length > 0) {
            setImageToCrop(images[0].preview);
            setPendingFiles(images.slice(1));
        }

    }, [existingFiles, maxFiles, name, setValue]);

    const removeFile = (index) => {
        const current = watch(name) || [];
        const updatedFiles = current.filter((_, i) => i !== index);
        setValue(name, updatedFiles, { shouldValidate: true });
    };

    const handleCropComplete = async (croppedDataUrl) => {
        // Create a new File object from the cropped result
        const res = await fetch(croppedDataUrl);
        const blob = await res.blob();
        const finalFile = new File([blob], "restaurant-image.jpg", { type: "image/jpeg" });
        Object.assign(finalFile, { preview: croppedDataUrl });

        // Append to the current file list, respecting the max limit
        const current = watch(name) || [];

        if (current.length < maxFiles) {
            setValue(name, [...current, finalFile], { shouldValidate: true });
        }

        // Process the next image in the queue if any
        if (pendingFiles.length > 0) {
            const next = pendingFiles[0];
            setPendingFiles(pendingFiles.slice(1));
            setImageToCrop(next.preview);
        } else {
            // Queue finished
            setImageToCrop(null);
            setPendingFiles([]);
        }
    };

    const handleCancelCrop = () => {
        // Clear queue and close modal
        setImageToCrop(null);
        setPendingFiles([]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
        maxFiles: maxFiles,
        multiple: true
    });

    return (
        <div className="w-full space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
                <span className="ml-2 text-xs font-normal text-gray-400">
                    (Max {maxFiles} images)
                </span>
            </label>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group
                    ${isDragActive
                        ? 'border-[#ff5e00] bg-orange-50'
                        : 'border-gray-200 hover:border-[#ff5e00] hover:bg-gray-50'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-white shadow-sm rounded-full text-[#ff5e00] group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                    </div>
                </div>
            </div>

            {existingFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {existingFiles.map((file, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                            <img
                                src={file.preview}
                                alt={`upload-${index}`}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="p-2 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                    title="Remove"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {errors[name] && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors[name].message}</p>
            )}

            {imageToCrop && (
                <ImageCropper
                    imageSrc={imageToCrop}
                    aspect={aspectRatio}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCancelCrop}
                />
            )}
        </div>
    );
};

export default MultiImageUpload;
