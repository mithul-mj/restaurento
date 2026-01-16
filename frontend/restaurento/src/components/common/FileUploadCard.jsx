import React, { useCallback } from 'react';
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { CheckCircle, X, Upload, FileCheck } from "lucide-react";

const FileUploadCard = ({
    name,
    label,
    required,
    acceptedFileTypes = { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] }
}) => {
    const { watch, setValue, formState: { errors } } = useFormContext();

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
        maxFiles: 1,
        multiple: false
    });

    const removeFile = (e) => {
        e.stopPropagation();
        setValue(name, null, { shouldValidate: true });
    };

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
                    {file.preview && (file.type?.startsWith('image') || file.isExisting) && (
                        <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                            <img src={file.preview} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                    )}
                    <button type="button" onClick={removeFile} className="p-1.5 hover:bg-green-100 text-green-700 rounded-full transition-colors">
                        <X size={16} />
                    </button>
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
        </div>
    );
};

export default FileUploadCard;