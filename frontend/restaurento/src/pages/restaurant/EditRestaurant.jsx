import { z } from 'zod'
import Step1BasicInfo from '../../components/onboarding/Step1BasicInfo'
import Step2Seating from '../../components/onboarding/Step2Seating'
import Loader from '../../components/Loader'

import { stepSchemas } from '../../schemas/onboardingSchema'
import restaurantService from '../../services/restaurant.service'
import { minutesToTime, timeToMinutes } from '../../utils/timeUtils'


import { showSuccess, showError } from '../../utils/alert'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const editRestaurantSchema = z.intersection(stepSchemas[0], stepSchemas[1]);


const EditRestaurant = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const methods = useForm({
        resolver: zodResolver(editRestaurantSchema),
        mode: 'onchange'
    });

    const { handleSubmit, reset, formState: { isSubmitting } } = methods;

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const { restaurant } = await restaurantService.getProfile()

                // Format opening hours from backend (minutes) to frontend (HH:MM)
                const formattedOpeningHours = {
                    ...restaurant.openingHours,
                    days: restaurant.openingHours.days.map(day => ({
                        ...day,
                        startTime: typeof day.startTime === 'number' ? minutesToTime(day.startTime) : day.startTime,
                        endTime: typeof day.endTime === 'number' ? minutesToTime(day.endTime) : day.endTime,
                    }))
                };

                const formattedData = {
                    description: restaurant.description,
                    tags: restaurant.tags || [],
                    openingHours: formattedOpeningHours,
                    slotConfig: restaurant.slotConfig || { duration: 60, gap: 0 },
                    totalSeats: restaurant.totalSeats,
                    slotPrice: restaurant.slotPrice,
                    images: restaurant.images?.map((url) => ({
                        preview: url,
                        isExisting: true,
                    })) || []

                }
                reset(formattedData)
            } catch (error) {
                showError("Error", "Failed to load restaurant")
            } finally {
                setIsLoading(false);
            };
        }
        fetchRestaurantData()
    }, [])

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append("description", data.description);
            formData.append("totalSeats", data.totalSeats);
            formData.append("slotPrice", data.slotPrice);
            formData.append("slotConfig", JSON.stringify(data.slotConfig));

            // Convert opening hours times back to minutes
            const openingHoursPayload = {
                ...data.openingHours,
                days: data.openingHours.days.map(day => ({
                    ...day,
                    startTime: typeof day.startTime === 'string' ? timeToMinutes(day.startTime) : day.startTime,
                    endTime: typeof day.endTime === 'string' ? timeToMinutes(day.endTime) : day.endTime,
                }))
            };
            formData.append("openingHours", JSON.stringify(openingHoursPayload));
            data.tags.forEach(tag => formData.append("tags[]", tag));
            if (data.images && data.images.length > 0) {
                data.images.forEach(file => {
                    if (!file.isExisting) {
                        formData.append("images", file);
                    }
                });
                const existingImages = data.images.filter(img => img.isExisting).map(img => img.preview);
                formData.append("existingImages", JSON.stringify(existingImages));
            }

            await restaurantService.updateProfile(formData);

            showSuccess("Updated!", "Your restaurant details have been updated.");
            navigate('/restaurant/settings'); // Redirect back to settings
        } catch (error) {
            showError("Update Failed", error.message || "Something went wrong.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader text="Loading Details..." />
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Edit Restaurant</h1>
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                            {/* Render Step 1: Basic Info */}
                            <Step1BasicInfo isEditing={true} />
                            <hr className="border-gray-100" />
                            {/* Render Step 2: Seating, Rates & Photos */}
                            <Step2Seating isEditing={true} />

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-[#ff5e00] text-white rounded-xl font-bold hover:bg-[#e05200] transition-colors shadow-lg disabled:opacity-70"
                                >
                                    {isSubmitting ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    );


}

export default EditRestaurant