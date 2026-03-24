import { useQuery, keepPreviousData } from "@tanstack/react-query";
import restaurantService from "../services/restaurant.service.js";

export const useEarnings = ({ page = 1, limit = 10, status = "all", search = "", date = "all", startDate = "", endDate = "" }) => {
    const queryKey = ["restaurant-earnings", page, limit, status, search, date, startDate, endDate];

    const query = useQuery({
        queryKey,
        queryFn: () => restaurantService.getEarnings({ page, limit, status, search, date, startDate, endDate }),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, 
    });

    return {
        ...query,
        earnings: query.data?.data?.stats || {},
        trend: query.data?.data?.trend || [],
        transactions: query.data?.data?.transactions || [],
        pagination: query.data?.data?.pagination || {
            total: 0,
            page,
            limit,
            pages: 0
        }
    };
};
