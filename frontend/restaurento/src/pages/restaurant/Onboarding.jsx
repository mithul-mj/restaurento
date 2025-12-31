import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "../../schemas/onboardingSchema";

const STEPS = ["Basic Info", "Seating & Photos", "Legal", "Menu", "Review"];
const Onboarding = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const methods = useForm({
        resolver: zodResolver(onboardingSchema),
        mode: "onChange",
        shouldUnregister: false,
    });
    const { handleSubmit, trigger } = methods;
    const handleNext = async () => {
        const isValid = await trigger();
        if (isValid) {
            setCurrentStep((prevStep) => prevStep + 1);
        }
    }
    const onSubmit = async (data) => {
        console.log("final onboarding data", data);
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
                            {currentStep === 0 && <Step1BasicInfo />}
                            {currentStep === 1 && <Step2Seating />}

                            <div className="flex justify-between mt-10 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(s => s - 1)}
                                    disabled={currentStep === 0}
                                    className="px-6 py-2 text-gray-500 font-semibold disabled:opacity-0"
                                >
                                    Back
                                </button>

                                {currentStep < STEPS.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="px-8 py-2 bg-[#ff5e00] text-white rounded-lg font-bold hover:bg-[#e05200]"
                                    >
                                        Next Step
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold"
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
