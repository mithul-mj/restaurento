import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminService from "../services/admin.service.js";

export const useRestaurants = ({ page, limit, search, sortBy, status }) => {
  const queryClient = useQueryClient();
  const queryKey = ["restaurants", page, limit, search, sortBy, status];

  const query = useQuery({
    queryKey,
    queryFn: () => adminService.fetchRestaurants({ page, limit, search, sortBy, status }),
    placeholderData: (previousData) => previousData,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (restaurantId) => adminService.toggleRestaurantStatus(restaurantId),

    onMutate: async (restaurantId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const restaurantToUpdate = old.data.find((r) => r._id === restaurantId);
        if (!restaurantToUpdate) return old;
        const isSuspending = restaurantToUpdate.status === "active";
        return {
          ...old,
          data: old.data.map((restaurant) =>
            restaurant._id === restaurantId
              ? {
                ...restaurant,
                status: restaurant.status === "active" ? "suspended" : "active",
              }
              : restaurant
          ),
          meta: {
            ...old.meta,
            suspendedCount: isSuspending
              ? old.meta.suspendedCount + 1
              : old.meta.suspendedCount - 1,
          },
        };
      });
      return { previousData };
    },
    onError: (err, restaurantId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    ...query,
    toggleStatus: toggleStatusMutation.mutate,
  };
};
