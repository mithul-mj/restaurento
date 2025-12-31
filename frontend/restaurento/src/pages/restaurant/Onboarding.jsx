import { useForm, FormProvider } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, stepSchemas } from "../../schemas/onboardingSchema";
import { Check } from "lucide-react";

import Step1BasicInfo from "../../components/onboarding/Step1BasicInfo";
import Step2Seating from "../../components/onboarding/Step2Seating";
import Step3Legal from "../../components/onboarding/Step3Legal";
import Step4Menu from "../../components/onboarding/Step4Menu";
import Step5Review from "../../components/onboarding/Step5Review";

const STEPS = ["Basic Info", "Seating & Photos", "Legal", "Menu", "Review"];

const Onboarding = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const methods = useForm({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            restaurantName: "",
            restaurantPhone: "",
            description: "",
            tags: [],
            openingHours: {
                isSameEveryDay: false,
                slots: [
                    { day: "Monday", open: "09:00", close: "22:00", isClosed: false },
                    { day: "Tuesday", open: "09:00", close: "22:00", isClosed: false },
                    { day: "Wednesday", open: "09:00", close: "22:00", isClosed: false },
                    { day: "Thursday", open: "09:00", close: "22:00", isClosed: false },
                    { day: "Friday", open: "09:00", close: "23:00", isClosed: false },
                    { day: "Saturday", open: "10:00", close: "23:00", isClosed: false },
                    { day: "Sunday", open: "10:00", close: "22:00", isClosed: false },
                ]
            },
            totalSeats: 0,
            images: [],
            address: "",
            menuItems: [],
            slotPrice: 0,
            termsAccepted: false
        },
        mode: "onChange",
        shouldUnregister: false,
    });

    const { handleSubmit, trigger } = methods;

    const handleNext = async () => {
        // Validate current step fields
        const currentSchema = stepSchemas[currentStep];
        if (currentSchema) {
            // Get keys from the Zod object shape
            // Note: If using complex Zod types (refines/intersections), this might need adjustment.
            // But for our simple objects, .shape or keyof override works.
            // safely accessing keys:
            const keys = Object.keys(currentSchema.shape);
            const isStepValid = await trigger(keys);
            if (isStepValid) {
                setCurrentStep((prevStep) => prevStep + 1);
            }
        } else {
            // Fallback or final step
            setCurrentStep((prevStep) => prevStep + 1);
        }
    }

    const onSubmit = async (data) => {
        const formData = new FormData();

        // Helper to append data
        const appendData = (data, rootKey) => {
            if (data instanceof FileList) {
                Array.from(data).forEach((file, index) => {
                    // For multiple files, we might stick to the same key or array notation depending on backend
                    // Here we assume 'images' -> multiple files
                    formData.append(rootKey, file);
                });
                return;
            } else if (data instanceof File) {
                formData.append(rootKey, data);
            } else if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    appendData(item, `${rootKey}[${index}]`);
                });
            } else if (typeof data === 'object' && data !== null) {
                Object.keys(data).forEach(key => {
                    const value = data[key];
                    if (rootKey) {
                        appendData(value, `${rootKey}.${key}`);
                    } else {
                        appendData(value, key);
                    }
                });
            } else {
                formData.append(rootKey, data);
            }
        };

        // Handle specific fields manually for better backend parsing if generic recursion is too messy
        // Basic Fields
        formData.append("restaurantName", data.restaurantName);
        formData.append("restaurantPhone", data.restaurantPhone);
        formData.append("description", data.description);
        formData.append("address", data.address);
        formData.append("totalSeats", data.totalSeats);
        formData.append("slotPrice", data.slotPrice);
        formData.append("licenseNumber", data.licenseNumber);

        // Tags
        data.tags.forEach(tag => formData.append("tags[]", tag));

        // JSON fields (if backend prefers JSON string for complex objects)
        formData.append("openingHours", JSON.stringify(data.openingHours));

        // Files - Step 2
        if (data.images && data.images.length > 0) {
            Array.from(data.images).forEach(file => {
                formData.append("images", file);
            });
        }

        // Files - Step 3
        if (data.businessCert && data.businessCert.length > 0) formData.append("businessCert", data.businessCert[0]);
        if (data.fssaiCert && data.fssaiCert.length > 0) formData.append("fssaiCert", data.fssaiCert[0]);

        // Menu Items - Complex array with files
        // Strategy: Send metadata as JSON, files separately keyed
        // OR: use deep index keys

        // Approach A: classic index keys
        data.menuItems.forEach((item, index) => {
            formData.append(`menuItems[${index}].name`, item.name);
            formData.append(`menuItems[${index}].price`, item.price);
            formData.append(`menuItems[${index}].description`, item.description || "");
            if (item.image && item.image.length > 0) {
                formData.append(`menuItems[${index}].image`, item.image[0]);
            }
        });

        console.log("Submitting FormData:");
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        alert("Check console for FormData payload! Ready for backend.");
        // TODO: await axios.post('/api/restaurant/onboarding', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">

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
                                <Step3Legal />
                            </div>
                            <div className={currentStep === 3 ? "block" : "hidden"}>
                                <Step4Menu />
                            </div>
                            <div className={currentStep === 4 ? "block" : "hidden"}>
                                <Step5Review />
                            </div>

                            <div className="flex justify-between mt-10 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(s => s - 1)}
                                    disabled={currentStep === 0}
                                    className="px-6 py-2 text-gray-500 font-semibold disabled:opacity-0 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Back
                                </button>

                                {currentStep < STEPS.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="px-8 py-2 bg-[#ff5e00] text-white rounded-lg font-bold hover:bg-[#e05200] transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Next Step
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Finish Setup
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
