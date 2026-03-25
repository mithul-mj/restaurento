import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";

const couponSchema = z.object({
    code: z.string({ required_error: "Coupon code is required" })
        .min(3, "Code must be at least 3 characters")
        .max(15, "Code is too long")
        .trim(),
    description: z.string({ required_error: "Description is required" })
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description is too long")
        .trim(),
    discountValue: z.preprocess(
        (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
        z.number({ required_error: "Discount percentage is required" }).min(1, "Minimum 1%").max(100, "Maximum 100%")
    ),
    maxDiscountCap: z.preprocess((val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)), 
        z.number({ required_error: "Max discount cap is required" })
        .min(1, "Cap must be at least ₹1")
        .max(1000, "Cap cannot exceed ₹1000")),
    minOrderValue: z.preprocess((val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)), 
        z.number().min(0, "Cannot be negative").max(5000, "Threshold cannot exceed ₹5000").optional()),
    expiryDate: z.string().optional().nullable().refine(val => {
        if (!val) return true;
        return new Date(val).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0);
    }, "Expiry date cannot be in the past"),
    usageLimit: z.preprocess((val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)), z.number().min(1, "Minimum 1 usage").max(10000, "Limit cannot exceed 10,000").optional()),
    isActive: z.boolean().default(true).optional()
}).refine((data) => {
    const cap = data.maxDiscountCap || 0;
    const minBill = data.minOrderValue || 0;
    return minBill >= cap;
}, {
    message: "Minimum order value must be greater than or equal to the maximum discount cap",
    path: ["minOrderValue"]
});

const CreateCouponModal = ({ isOpen, onClose, onCreate, isCreating, initialData }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            description: "",
            discountValue: 0,
            maxDiscountCap: 0,
            minOrderValue: 0,
            expiryDate: "",
            usageLimit: 0,
            isActive: true
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    code: initialData.code || "",
                    description: initialData.description || "",
                    discountValue: initialData.discountValue || 0,
                    maxDiscountCap: initialData.maxDiscountCap || 0,
                    minOrderValue: initialData.minOrderValue || 0,
                    expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : "",
                    usageLimit: initialData.usageLimit || 0,
                    isActive: initialData.isActive ?? true
                });
            } else {
                reset({
                    code: "",
                    description: "",
                    discountValue: 0,
                    maxDiscountCap: 0,
                    minOrderValue: 0,
                    expiryDate: "",
                    usageLimit: 0,
                    isActive: true
                });
            }
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const onFormSubmit = (data) => {
        // Pre-process date and limits if needed, string dates can usually be submitted straight to express
        onCreate(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">{initialData ? "Edit Coupon" : "Create New Coupon"}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6 overflow-y-auto">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Coupon Code</label>
                            <input
                                type="text"
                                placeholder="e.g. SUMMER50"
                                {...register("code")}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all uppercase"
                            />
                            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Discount Percentage (%)</label>
                            <input
                                type="number"
                                placeholder="e.g. 20"
                                {...register("discountValue")}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all"
                            />
                            {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Description</label>
                        <textarea
                            placeholder="Brief description of the promotion"
                            {...register("description")}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all min-h-[80px]"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Max Discount Cap (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 100"
                                {...register("maxDiscountCap")}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all"
                            />
                            {errors.maxDiscountCap && <p className="text-red-500 text-xs mt-1">{errors.maxDiscountCap.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Min Order Value (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 500"
                                {...register("minOrderValue")}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all"
                            />
                            {errors.minOrderValue && <p className="text-red-500 text-xs mt-1">{errors.minOrderValue.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Expiry Date</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                {...register("expiryDate")}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all"
                            />
                            {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Usage Limit</label>
                            <input
                                type="number"
                                placeholder="e.g. 100 uses total"
                                {...register("usageLimit")}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all"
                            />
                            {errors.usageLimit && <p className="text-red-500 text-xs mt-1">{errors.usageLimit.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Coupon Status</p>
                            <p className="text-xs text-gray-500 mt-0.5">Activate or deactivate immediately</p>
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

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[#ff5e00] rounded-xl hover:bg-[#e05200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-orange-200"
                        >
                            {isCreating ? "Saving..." : (initialData ? "Update Coupon" : "Save Coupon")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCouponModal;
