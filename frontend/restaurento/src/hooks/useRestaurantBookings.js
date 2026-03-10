import { useQuery, keepPreviousData } from "@tanstack/react-query";
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
