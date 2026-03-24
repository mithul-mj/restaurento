import React, { useCallback, useState } from 'react';
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { CheckCircle, X, Upload, FileCheck, FileText } from "lucide-react";
import ImageCropper from './ImageCropper';

const FileUploadCard = ({
    name,
    label,
    required,
    acceptedFileTypes = { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    aspectRatio = 16 / 9
}) => {
    const { watch, setValue, formState: { errors } } = useFormContext();
    const [imageToCrop, setImageToCrop] = useState(null);

    const file = watch(name);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            Object.assign(file, { preview: dataUrl });

            const isImage = file.type.startsWith('image/') || (typeof file.preview === 'string' && file.preview.startsWith('data:image'));

            if (isImage) {
                setImageToCrop(file.preview);
            } else {
                setValue(name, file, { shouldValidate: true });
            }
        }
    }, [name, setValue]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        maxFiles: 1,
        multiple: false
    });

    const removeFile = (e) => {
        e && e.stopPropagation();
        setValue(name, null, { shouldValidate: true });
    };

    const handleCropComplete = async (croppedDataUrl) => {
        const res = await fetch(croppedDataUrl);
        const blob = await res.blob();
        const finalFile = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
        Object.assign(finalFile, { preview: croppedDataUrl });

        setValue(name, finalFile, { shouldValidate: true });
        setImageToCrop(null);
    };

    const handleCancelCrop = () => {
        setImageToCrop(null);
    };

    const isImage = file && (
        file.type?.startsWith('image') ||
        (typeof file.preview === 'string' && (
            file.preview.startsWith('data:image') ||
            (!/\.(pdf|doc|docx|xls|xlsx|txt)($|\?)/i.test(file.preview))
        ))
    );

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                    <FileCheck size={16} className="text-[#ff5e00]" />
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </h4>
            </div>

            {file ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-green-100">
                            <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {file.preview && isImage ? (
                            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-gray-200 hidden sm:block">
                                <img src={file.preview} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100/50 hidden sm:flex">
                                <FileText size={20} className="text-[#ff5e00]" />
                            </div>
                        )}


                        <button type="button" onClick={removeFile} className="p-1.5 hover:bg-red-100 text-red-500 rounded-full transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer 
                        ${isDragActive ? 'border-[#ff5e00] bg-orange-50' : 'border-gray-200 hover:border-[#ff5e00] hover:bg-gray-50'}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-full text-gray-400">
                            <Upload size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                        </div>
                    </div>
                </div>
            )}
            {errors[name] && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                <X size={12} /> {errors[name].message}
            </p>}

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

export default FileUploadCard;
