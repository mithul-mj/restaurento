import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Tag, IndianRupee, Zap, Calendar } from "lucide-react";

const offerSchema = z.object({
  discountValue: z.preprocess(
    (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
    z.number({ required_error: "Discount amount is required" }).min(1, "Minimum ₹1 discount")
  ),
  minOrderValue: z.preprocess(
    (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
    z.number().min(0, "Cannot be negative").optional()
  ),
  usageLimit: z.preprocess(
    (val) => (val === "" || isNaN(val) || val === null ? undefined : Number(val)),
    z.number({ required_error: "Usage limit is required" }).min(1, "Minimum 1 usage")
  ),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable()
});

const CreateOfferModal = ({ isOpen, onClose, onCreate, isCreating, initialData }) => {
  const today = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      discountValue: 0,
      minOrderValue: 0,
      usageLimit: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: ""
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          discountValue: initialData.discountValue,
          minOrderValue: initialData.minOrderValue,
          usageLimit: initialData.usageLimit,
          validFrom: initialData.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : "",
          validUntil: initialData.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : ""
        });
      } else {
        reset({
          discountValue: 0,
          minOrderValue: 0,
          usageLimit: 0,
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: ""
        });
      }
    }
  }, [isOpen, reset, initialData]);

  if (!isOpen) return null;

  const onFormSubmit = (data) => {
    onCreate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-orange-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{initialData ? "Edit Promotion" : "Create New Offer"}</h2>
            <p className="text-xs text-gray-500 mt-1">{initialData ? "Update your discount campaign details" : "Automatic flat discount for your customers"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 space-y-5">
          {/* Discount Value */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Zap size={16} className="text-orange-500" />
              Flat Discount Amount (₹)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
              <input
                type="number"
                placeholder="e.g. 100"
                {...register("discountValue")}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold"
              />
            </div>
            {errors.discountValue && <p className="text-red-500 text-xs mt-1 ml-2">{errors.discountValue.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Min Order Value */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <IndianRupee size={16} className="text-green-500" />
                Min Bill (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                {...register("minOrderValue")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
              />
              {errors.minOrderValue && <p className="text-red-500 text-xs mt-1">{errors.minOrderValue.message}</p>}
            </div>

            {/* Usage Limit */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Tag size={16} className="text-purple-500" />
                Campaign Limit
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                {...register("usageLimit")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
              />
              {errors.usageLimit && <p className="text-red-500 text-xs mt-1">{errors.usageLimit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Valid From */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                Start Date
              </label>
              <input
                type="date"
                min={!initialData ? today : undefined}
                {...register("validFrom")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
              />
              {errors.validFrom && <p className="text-red-500 text-xs mt-1">{errors.validFrom.message}</p>}
            </div>

            {/* Valid Until */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar size={16} className="text-red-500" />
                Expiry Date
              </label>
              <input
                type="date"
                min={today}
                {...register("validUntil")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
              />
              {errors.validUntil && <p className="text-red-500 text-xs mt-1">{errors.validUntil.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-[2] px-4 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-[#ff5e00] rounded-2xl hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (initialData ? "Updating..." : "Creating Campaign...") : (initialData ? "Save Changes" : "Launch Offer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfferModal;
