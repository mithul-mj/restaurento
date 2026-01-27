import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, stepSchemas } from "../../schemas/onboardingSchema";
import { Check } from "lucide-react";
import { showSuccess, showError, showConfirm } from "../../utils/alert.js";
import { updateUser } from "../../redux/slices/authSlice.js";


import Step1BasicInfo from "../../components/onboarding/Step1BasicInfo";
import Step2Seating from "../../components/onboarding/Step2Seating";
import Step4Menu from "../../components/onboarding/Step4Menu";
import Step5Review from "../../components/onboarding/Step5Review";
import restaurantService from '../../services/restaurant.service.js'
import Loader from "../../components/Loader";

const STEPS = ["Basic Info", "Seating & Photos", "Menu", "Review"];

const Onboarding = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState(0);
    const methods = useForm({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            description: "",
            tags: [],
            openingHours: {
                isSameEveryDay: false,
                days: [
                    { startTime: "09:00", endTime: "22:00", isClosed: false, generatedSlots: [] }, // Monday
                    { startTime: "09:00", endTime: "22:00", isClosed: false, generatedSlots: [] }, // Tuesday
                    { startTime: "09:00", endTime: "22:00", isClosed: false, generatedSlots: [] }, // Wednesday
                    { startTime: "09:00", endTime: "22:00", isClosed: false, generatedSlots: [] }, // Thursday
                    { startTime: "09:00", endTime: "23:00", isClosed: false, generatedSlots: [] }, // Friday
                    { startTime: "10:00", endTime: "23:00", isClosed: false, generatedSlots: [] }, // Saturday
                    { startTime: "10:00", endTime: "22:00", isClosed: false, generatedSlots: [] }, // Sunday
                ]
            },
            slotConfig: {
                duration: 60,
                gap: 0
            },
            totalSeats: 0,
            images: [],
            menuItems: [],
            slotPrice: 0,
            termsAccepted: false
        },
        mode: "onChange",
        shouldUnregister: false,
    });

    const { handleSubmit, trigger, formState: { isSubmitting } } = methods;

    const handleNext = async () => {
        const currentSchema = stepSchemas[currentStep];
        if (currentSchema) {
            const keys = Object.keys(currentSchema.shape);
            const isStepValid = await trigger(keys);
            if (isStepValid) {
                setCurrentStep((prevStep) => prevStep + 1);
            }
        } else {
            setCurrentStep((prevStep) => prevStep + 1);
        }
    }

    const onSubmit = async (data) => {
        const result = await showConfirm(
            "Submit Application?",
            "Are you sure you want to submit your restaurant details? You won't be able to edit them until approved.",
            "Yes, Submit"
        );

        if (!result.isConfirmed) return;

        const formData = new FormData();
        formData.append("description", data.description);
        formData.append("totalSeats", data.totalSeats);
        formData.append("slotPrice", data.slotPrice);

        formData.append("slotConfig", JSON.stringify(data.slotConfig));

        data.tags.forEach(tag => formData.append("tags[]", tag));

        formData.append("openingHours", JSON.stringify(data.openingHours));

        if (data.images && data.images.length > 0) {
            Array.from(data.images).forEach(file => {
                formData.append("images", file);
            });
        }

        data.menuItems.forEach((item, index) => {
            formData.append(`menuItems[${index}].name`, item.name);
            formData.append(`menuItems[${index}].price`, item.price);
            formData.append(`menuItems[${index}].description`, item.description || "");

            if (item.categories && item.categories.length > 0) {
                item.categories.forEach((cat, catIndex) => {
                    formData.append(`menuItems[${index}].categories[${catIndex}]`, cat);
                });
            }

            if (item.image && item.image.length > 0) {
                formData.append(`menuItems[${index}].image`, item.image[0]);
            }
        });

        try {
            await restaurantService.onboard(formData);
            await showSuccess("Submission Successful!", "Your restaurant application has been submitted and is pending approval.");
            dispatch(updateUser({ isOnboardingCompleted: true }));
            navigate('/restaurant/dashboard');
        } catch (error) {
            console.error("Onboarding failed:", error);
            const message = error.response?.data?.message || error.response?.data?.error || "Failed to submit onboarding details. Please try again.";
            showError("Submission Failed", message);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto transition-all duration-300">

                <div className="flex justify-between mb-12 relative">
                    {STEPS.map((label, index) => (
                        <div key={label} className="flex flex-col items-center z-10 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                ${currentStep > index ? "bg-[#ff5e00] border-[#ff5e00] text-white" :
                                    currentStep === index ? "border-[#ff5e00] text-[#ff5e00]" : "bg-white border-gray-300 text-gray-400"}`}>
                                {currentStep > index ? <Check size={20} /> : index + 1}
                            </div>
                            <p className={`text-[10px] font-bold mt-2 uppercase ${currentStep >= index ? "text-gray-800" : "text-gray-400"}`}>
                                {label}
                            </p>
                        </div>
                    ))}
                    <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 -z-0" />
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className={currentStep === 0 ? "block" : "hidden"}>
                                <Step1BasicInfo />
                            </div>
                            <div className={currentStep === 1 ? "block" : "hidden"}>
                                <Step2Seating />
                            </div>
                            <div className={currentStep === 2 ? "block" : "hidden"}>
                                <Step4Menu />
                            </div>
                            <div className={currentStep === 3 ? "block" : "hidden"}>
                                <Step5Review />
                            </div>

                            <div className="flex justify-between mt-10 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(s => s - 1)}
                                    disabled={currentStep === 0}
                                    className="px-8 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg disabled:opacity-0 hover:bg-gray-200 transition-colors"
                                >
                                    Back
                                </button>

                                {currentStep < STEPS.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="px-8 py-2.5 bg-[#ff5e00] text-white rounded-lg font-bold hover:bg-[#e05200] transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Next Step
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader className="text-white" />
                                                <span>Submitting...</span>
                                            </div>
                                        ) : (
                                            "Finish Setup"
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
