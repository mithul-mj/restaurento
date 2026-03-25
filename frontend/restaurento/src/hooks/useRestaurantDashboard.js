import { useQuery } from "@tanstack/react-query";
import restaurantService from "../services/restaurant.service.js";

export const useRestaurantDashboard = (dateFilter = "thisMonth") => {
    return useQuery({
        queryKey: ["restaurant-dashboard", dateFilter],
        queryFn: () => restaurantService.getDashboardStats(dateFilter),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
