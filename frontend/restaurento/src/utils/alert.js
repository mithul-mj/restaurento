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

export const showConfirm = (title, text, confirmButtonText = "Yes, do it!", icon = "warning", isHtml = false) => {
    return Swal.fire({
        ...swalStandardOptions,
        title,
        text: isHtml ? undefined : text,
        html: isHtml ? text : undefined,
        icon,
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

import restaurantService from '../services/restaurant.service';

export const showScheduleClosure = () => {
    return Swal.fire({
        ...swalStandardOptions,
        title: 'Schedule Temporary Closure',
        html: `
            <div class="text-left space-y-4 py-2">
                <p class="text-sm text-gray-500 mb-4 font-medium">Set a date and time for your restaurant to automatically re-open and decide if you want to cancel existing bookings.</p>
                <div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Date</label>
                            <input id="closedTillDate" type="date" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#ff5e00] outline-none text-sm font-bold" min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Time</label>
                            <input id="closedTillTime" type="time" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#ff5e00] outline-none text-sm font-bold" value="09:00">
                        </div>
                    </div>
                    <div id="bookingInfo" class="mt-2 text-[11px] font-bold text-orange-600 hidden animate-in fade-in slide-in-from-top-1">
                        <span id="bookingCount">0</span> bookings will be affected in this period
                    </div>
                </div>
                <div class="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mt-4">
                    <input id="shouldCancelBookings" type="checkbox" class="w-4 h-4 mt-0.5 text-[#ff5e00] rounded focus:ring-[#ff5e00] cursor-pointer">
                    <label for="shouldCancelBookings" class="text-xs font-bold text-red-800 cursor-pointer leading-relaxed">
                        Cancel and refund all existing bookings during this period
                    </label>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirm Closure',
        cancelButtonText: 'Cancel',
        didOpen: () => {
            const dateInput = document.getElementById('closedTillDate');
            const timeInput = document.getElementById('closedTillTime');
            const infoDiv = document.getElementById('bookingInfo');
            const countSpan = document.getElementById('bookingCount');

            const updateCount = async () => {
                const date = dateInput.value;
                const time = timeInput.value;
                if (date && time) {
                    const combined = new Date(`${date}T${time}`);
                    try {
                        const res = await restaurantService.getAffectedBookingsCount(combined);
                        if (res.success) {
                            countSpan.innerText = res.count;
                            infoDiv.classList.remove('hidden');
                        }
                    } catch (error) {
                          console.error("Failed to fetch booking count", error);
                    }
                } else {
                    infoDiv.classList.add('hidden');
                }
            };

            dateInput.addEventListener('change', updateCount);
            timeInput.addEventListener('change', updateCount);
        },
        preConfirm: () => {
            const date = document.getElementById('closedTillDate').value;
            const time = document.getElementById('closedTillTime').value;
            const shouldCancel = document.getElementById('shouldCancelBookings').checked;

            if (!date || !time) {
                Swal.showValidationMessage('Please select both date and time');
                return false;
            }

            const combinedDateTime = new Date(`${date}T${time}`);
            if (combinedDateTime <= new Date()) {
                Swal.showValidationMessage('Re-opening must be in the future');
                return false;
            }

            return { closedTill: combinedDateTime, shouldCancelBookings: shouldCancel };
        }
    });
};

export { toast };
