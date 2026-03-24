import { useQuery } from "@tanstack/react-query";
import adminService from "../services/admin.service";

export const useAdminDashboard = (timeframe) => {
    return useQuery({
        queryKey: ["adminDashboard", timeframe],
        queryFn: () => adminService.getDashboardStats(timeframe),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
