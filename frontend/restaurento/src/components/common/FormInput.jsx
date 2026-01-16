import { useFormContext } from "react-hook-form";

const FormInput = ({ label, name, placeholder, icon: Icon, required }) => {
    const { register, formState: { errors } } = useFormContext();
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                {Icon && <Icon size={16} className="text-gray-400" />}
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                {...register(name)}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#ff5e00]/20 outline-none transition-all
                    ${errors[name] ? "border-red-300 focus:border-red-500 bg-red-50/10" : "border-gray-200 focus:border-[#ff5e00] bg-white"}
                `}
            />
            {errors[name] && <p className="text-red-500 text-xs font-medium">{errors[name].message}</p>}
        </div>
    );
};

export default FormInput;