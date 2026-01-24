import Swal from "sweetalert2";

export const showAlert = (title, text, icon = "success", confirmButtonText = "OK") => {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText,
        customClass: {
            popup: "dark:bg-gray-800 dark:text-white",
            title: "dark:text-white",
            content: "dark:text-gray-300",
        },
    });
};

export const showSuccess = (title, text) => {
    return showAlert(title, text, "success");
};

export const showError = (title, text) => {
    return showAlert(title, text || "Something went wrong!", "error");
};

export const showConfirm = (title, text, confirmButtonText = "Yes, do it!") => {
    return Swal.fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText,
        customClass: {
            popup: "dark:bg-gray-800 dark:text-white",
            title: "dark:text-white",
            content: "dark:text-gray-300",
        },
    });
};

export const showPrompt = (title, text, confirmButtonText = "Submit", inputPlaceholder = "Enter your reason") => {
    return Swal.fire({
        title,
        text,
        input: "textarea",
        inputPlaceholder,
        showCancelButton: true,
        confirmButtonText,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        customClass: {
            popup: "dark:bg-gray-800 dark:text-white",
            title: "dark:text-white",
            content: "dark:text-gray-300",
            input: "dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600",
        },
        preConfirm: (value) => {
            if (!value) {
                Swal.showValidationMessage("You need to write something!");
            }
            return value;
        }
    });
};

import { toast } from "sonner";

export const showToast = (message, type = "success") => {
    switch (type) {
        case "success":
            toast.success(message);
            break;
        case "error":
            toast.error(message);
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
