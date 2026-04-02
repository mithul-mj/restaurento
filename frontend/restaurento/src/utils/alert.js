import Swal from "sweetalert2";
import { toast } from "sonner";

// Helper for brand-standard SweetAlert options
const swalStandardOptions = {
    confirmButtonColor: "#ff5e00", // Restaurento Brand Orange
    cancelButtonColor: "#f3f4f6", // Light Gray
    background: "#fff",
    color: "#111827", // text-gray-900
    backdrop: `rgba(0,0,0,0.4) blur(4px)`, // Modern backdrop blur
    customClass: {
        popup: "rounded-2xl shadow-2xl border-none",
        title: "text-xl font-bold text-gray-900",
        htmlContainer: "text-gray-600 text-sm font-medium",
        confirmButton: "px-8 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105",
        cancelButton: "px-8 py-2.5 rounded-xl font-bold text-gray-600 border border-gray-100 transition-all hover:bg-gray-100",
        input: "rounded-xl border border-gray-100 bg-gray-50 focus:border-[#ff5e00] outline-none",
    },
    buttonsStyling: true,
};

export const showAlert = (title, text, icon = "success", confirmButtonText = "OK") => {
    return Swal.fire({
        ...swalStandardOptions,
        title,
        text,
        icon,
        confirmButtonText,
    });
};

export const showSuccess = (title, text) => {
    return showAlert(title, text, "success");
};

export const showError = (title, text) => {
    return showAlert(title, text || "Something went wrong!", "error");
};

export const showConfirm = (title, text, confirmButtonText = "Yes, do it!", isHtml = false) => {
    return Swal.fire({
        ...swalStandardOptions,
        title,
        text: isHtml ? undefined : text,
        html: isHtml ? text : undefined,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: "Cancel",
    });
};

export const showPrompt = (title, text, confirmButtonText = "Submit", inputPlaceholder = "Enter your reason") => {
    return Swal.fire({
        ...swalStandardOptions,
        title,
        text,
        input: "textarea",
        inputPlaceholder,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: "Cancel",
        preConfirm: (value) => {
            if (!value) {
                Swal.showValidationMessage("You need to write something!");
            }
            return value;
        }
    });
};

export const showToast = (message, type = "success") => {
    switch (type) {
        case "success":
            toast.success(message);
            break;
        case "error":
            toast.error(message, {
                style: { backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b' }
            });
            break;
        case "info":
            toast.info(message);
            break;
        case "warning":
            toast.warning(message);
            break;
        default:
            toast(message);
    }
};

export const showLoading = (message) => {
    return toast.loading(message);
};

export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};

export { toast };
