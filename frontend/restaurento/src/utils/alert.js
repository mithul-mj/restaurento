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

export const showToast = (title, icon = "success") => {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        },
        customClass: {
            popup: "dark:bg-gray-800 dark:text-white",
        },
    });
    Toast.fire({
        icon,
        title,
    });
};
