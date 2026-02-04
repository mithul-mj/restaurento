import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/slices/authSlice';
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { FileText, CheckCircle, X, Upload, MapPin, Building, Tag, FileCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSuccess, showConfirm, showError } from "../../utils/alert";
import FileUploadCard from '../../components/common/FileUploadCard';
import FormInput from '../../components/common/FormInput';
import preApprovalSchema from '../../schemas/preApprovalSchema';
import restaurantService from '../../services/restaurant.service';
import MapContainer from '../../components/restaurant/MapContainer';

const PreApproval = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const methods = useForm({
        resolver: zodResolver(preApprovalSchema),
        mode: "onChange"
    });

    const { user } = useSelector(state => state.auth);
    const [rejectionReason, setRejectionReason] = useState(null);

    const { handleSubmit, setValue, formState: { isSubmitting } } = methods;

    useEffect(() => {
        if (user?.verificationStatus === 'rejected') {
            const loadData = async () => {
                try {
                    const { restaurant } = await restaurantService.getProfile();

                    if (restaurant.verificationHistory?.length > 0) {
                        const latestRejection = restaurant.verificationHistory[restaurant.verificationHistory.length - 1];
                        if (latestRejection) {
                            setRejectionReason(latestRejection.reason);
                        }
                    }

                    setValue('restaurantName', restaurant.restaurantName);
                    setValue('restaurantPhone', restaurant.restaurantPhone);
                    setValue('address', restaurant.address);
                    if (restaurant.location?.coordinates) {
                        setValue('longitude', restaurant.location.coordinates[0]);
                        setValue('latitude', restaurant.location.coordinates[1]);
                    }

                    const mockFile = (url) => {
                        if (!url) return [];
                        return [{
                            name: "Existing Document",
                            size: 0,
                            preview: url,
                            isExisting: true
                        }];
                    };

                    setValue('restaurantLicense', mockFile(restaurant.documents?.restaurantLicense));
                    setValue('businessCert', mockFile(restaurant.documents?.businessCert));
                    setValue('fssaiCert', mockFile(restaurant.documents?.fssaiCert));
                    setValue('ownerIdCert', mockFile(restaurant.documents?.ownerIdCert));
                } catch (error) {
                    console.error("Failed to load profile", error);
                }
            };
            loadData();
        }
    }, [user, setValue]);

    const handleLocationSelect = useCallback((loc) => {
        console.log("Location Selected:", loc);
        setValue('latitude', loc.lat);
        setValue('longitude', loc.lng);
        if (loc.address) {
            console.log("Setting address to:", loc.address);
            setValue('address', loc.address, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        } else {
            console.warn("No address returned for location:", loc);
        }
    }, [setValue]);

    const onSubmit = async (data) => {
        const confirm = await showConfirm(
            "Submit for Pre-Approval?",
            "Please verify all details. You cannot edit this after submission.",
            "Yes, Submit"
        );

        if (confirm.isConfirmed) {
            console.log("Pre-Approval Data:", data);
            try {
                const formData = new FormData();
                formData.append("restaurantName", data.restaurantName);
                formData.append("restaurantPhone", data.restaurantPhone);
                formData.append("address", data.address);
                if (data.latitude) formData.append("latitude", data.latitude);
                if (data.longitude) formData.append("longitude", data.longitude);

                const fileFields = ["restaurantLicense", "businessCert", "fssaiCert", "ownerIdCert"];
                fileFields.forEach(field => {
                    if (data[field] && data[field].length > 0) {
                        if (!data[field][0].isExisting) {
                            formData.append(field, data[field][0]);
                        }
                    }
                });

                const response = await restaurantService.preApproval(formData);
                if (!response.success) {
                    throw new Error(response.message);
                }
                showSuccess("Submitted!", "Your application is under review.");
                dispatch(updateUser({ verificationStatus: 'pending' }));
                navigate('/restaurant/verification-pending', { replace: true });
            } catch (error) {
                console.error("Error submitting pre-approval:", error);
                showError("Error submitting pre-approval", error.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Restaurant Pre-Approval</h1>
                    <p className="text-gray-500 mt-2 text-lg">Submit your basic details and documents to get started.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-[#ff5e00] to-orange-400" />

                    <div className="p-8 md:p-10">
                        <FormProvider {...methods}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                        <Building className="text-[#ff5e00]" size={20} />
                                        Basic Information
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormInput
                                            name="restaurantName"
                                            label="Restaurant Name"
                                            placeholder="e.g. The Gourmet Kitchen"
                                            icon={Building}
                                            required
                                        />
                                        <FormInput
                                            name="restaurantPhone"
                                            label="Restaurant Phone"
                                            placeholder="e.g. +1234567890"
                                            icon={Building} // or Phone icon if available, but Building is fine for now as placeholder
                                            required
                                        />
                                    </div>



                                    <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="col-span-2">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                                                <MapPin size={16} className="text-[#ff5e00]" />
                                                Location Coordinates <span className="text-red-500">*</span>
                                            </label>
                                            <p className="text-xs text-gray-500 mb-4">Provide latitude and longitude for accurate map placement.</p>
                                        </div>
                                        <div className="col-span-2">
                                            <MapContainer onLocationSelect={handleLocationSelect} />
                                        </div>
                                        <div className="flex flex-col gap-1 text-xs text-gray-500 font-mono">
                                            <div className="flex gap-4">
                                                <span>Lat: {methods.watch('latitude') ? Number(methods.watch('latitude')).toFixed(6) : '—'}</span>
                                                <span>Lng: {methods.watch('longitude') ? Number(methods.watch('longitude')).toFixed(6) : '—'}</span>
                                            </div>
                                            {methods.formState.errors.latitude && (
                                                <span className="text-red-500">Location selection is required. Please click on the map.</span>
                                            )}
                                        </div>

                                    </div>
                                    <FormInput
                                        name="address"
                                        label="Full Address"
                                        placeholder="Street, City, State, Zip Code"
                                        icon={MapPin}
                                        required
                                    />
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                        <FileText className="text-[#ff5e00]" size={20} />
                                        Required Documents
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FileUploadCard
                                            name="restaurantLicense"
                                            label="Restaurant License"
                                            required
                                        />
                                        <FileUploadCard
                                            name="businessCert"
                                            label="Business Registration"
                                            required
                                        />
                                        <FileUploadCard
                                            name="fssaiCert"
                                            label="FSSAI License"
                                            required
                                        />
                                        <FileUploadCard
                                            name="ownerIdCert"
                                            label="Owner's ID Proof"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`
                                            px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-orange-200 transform transition-all 
                                            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff5e00] hover:bg-[#e05200] hover:-translate-y-1 hover:shadow-xl'}
                                        `}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Submitting...
                                            </div>
                                        ) : (
                                            "Submit Application"
                                        )}
                                    </button>
                                </div>

                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreApproval;
