import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import userService from "../services/user.service.js";
import { showToast, showError } from "../utils/alert";

export const useBookings = ({ type = 'upcoming', page = 1, limit = 3 }) => {
    const queryClient = useQueryClient();
    const queryKey = ["bookings", type, page, limit];

    const query = useQuery({
        queryKey,
        queryFn: () => userService.getMyBookings({ type, page, limit }),
        placeholderData: keepPreviousData,
    });

    const cancelBookingMutation = useMutation({
        mutationFn: (bookingId) => userService.cancelBooking(bookingId),
        onSuccess: (data) => {
            showToast("Booking canceled successfully.", "success");
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
        onError: (err) => {
            showError("Cancellation Failed", err.response?.data?.message || "Something went wrong.");
        }
    });

    return {
        ...query,
        cancelBooking: cancelBookingMutation.mutate,
        isCanceling: cancelBookingMutation.isPending
    };
};
