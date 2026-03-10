import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import restaurantService from "../services/restaurant.service";

export const useRestaurantBookings = ({ page = 1, limit = 10, status = "all", search = "" }) => {
  const queryKey = ["restaurant-bookings", page, limit, status, search];

  const query = useQuery({
    queryKey,
    queryFn: () => restaurantService.getBookings({ page, limit, status, search }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
  };
};

export const useBookingDetails = (bookingId) => {
  return useQuery({
    queryKey: ["booking-details", bookingId],
    queryFn: () => restaurantService.getBookingDetails(bookingId),
    enabled: !!bookingId,
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }) => restaurantService.updateBookingStatus(bookingId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["booking-details", variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-bookings"] });
    },
  });
};
