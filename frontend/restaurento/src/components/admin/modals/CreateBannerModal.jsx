import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CloudUpload } from "lucide-react";
import ImageCropper from "../../common/ImageCropper";
import { showToast } from "../../../utils/alert";
import { bannerSchema } from "../../../schemas/bannerSchema";

const CreateBannerModal = ({ isOpen, onClose, onCreate, isCreating, initialData }) => {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(bannerSchema),
        defaultValues: {
            targetLink: "",
            isActive: true,
            image: null
        }
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);
    const fileInputRef = useRef(null);

    const imageFile = watch("image");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    targetLink: initialData.targetLink || "",
                    isActive: initialData.isActive,
                    image: null
                });
                setPreviewUrl(initialData.imageUrl);
            } else {
                reset({
                    targetLink: "",
                    isActive: true,
                    image: null
                });
                setPreviewUrl(null);
            }
            setCropperOpen(false);
            setTempImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const handleFileSelect = (file) => {
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast("Please upload a valid image file.", "error");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            // Validate size
            if (file.size > 5 * 1024 * 1024) {
                showToast("Banner image must be under 5MB.", "error");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            setTempImageSrc(URL.createObjectURL(file));
            setCropperOpen(true);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCropComplete = async (croppedDataUrl) => {
        setPreviewUrl(croppedDataUrl);
        try {
            const res = await fetch(croppedDataUrl);
            const blob = await res.blob();
            const croppedFile = new File([blob], "banner-cropped.jpg", { type: "image/jpeg" });

            setValue("image", croppedFile, { shouldValidate: true, shouldDirty: true });
            setCropperOpen(false);
        } catch (error) {
            console.error("Error creating file from crop:", error);
        }
    };

    const onFormSubmit = (data) => {
        if (!data.image && !initialData) return;

        const formData = new FormData();
        if (data.image) {
            formData.append("image", data.image);
        }
        formData.append("targetLink", data.targetLink);
        formData.append("isActive", data.isActive);

        onCreate(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {cropperOpen && (
                <div style={{ position: 'fixed', zIndex: 9999 }}>
                    <ImageCropper
                        imageSrc={tempImageSrc}
                        onCropComplete={handleCropComplete}
                        onCancel={() => setCropperOpen(false)}
                        aspect={16 / 5}
                    />
                </div>
            )}

            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{initialData ? "Edit Banner" : "Create New Banner"}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Banner Image</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleFileSelect(e.dataTransfer.files[0]);
                            }}
                            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#ff5e00] hover:bg-orange-50/10 transition-colors bg-gray-50 group"
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="p-3 mb-3 rounded-full bg-orange-50 text-[#ff5e00]">
                                        <CloudUpload size={24} />
                                    </div>
                                    <p className="mb-2 text-sm text-gray-900 font-medium">Click to upload</p>
                                    <p className="absolute bottom-3 right-4 text-xs text-gray-400">Rec. 1600x500</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Banner Link</label>
                        <input
                            type="text"
                            placeholder="e.g., https://mithul-mj.github.io/"
                            {...register("targetLink")}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all placeholder:text-gray-400"
                        />
                        {errors.targetLink && <p className="text-red-500 text-xs mt-1">{errors.targetLink.message}</p>}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Status</p>
                            <p className="text-xs text-gray-500 mt-0.5">Visible to customers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                {...register("isActive")}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff5e00]"></div>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={(!imageFile && !initialData) || isCreating}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[#ff5e00] rounded-xl hover:bg-[#e05200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-orange-200"
                        >
                            {isCreating ? "Saving..." : (initialData ? "Update Banner" : "Save Banner")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBannerModal;
