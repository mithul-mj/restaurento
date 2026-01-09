import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminService from "../services/admin.service.js";

export const useUsers = ({ page, limit, search, sortBy, status }) => {
  const queryClient = useQueryClient();
  const queryKey = ["users", page, limit, search, sortBy, status];
  const query = useQuery({
    queryKey,
    queryFn: () => adminService.fetchUsers({ page, limit, search, sortBy, status }),
    placeholderData: (previousData) => previousData,
  });
  const toggleStatusMutation = useMutation({
    mutationFn: (userId) => adminService.toggleUserStatus(userId),

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const userToUpdate = old.data.find((u) => u._id === userId);
        if (!userToUpdate) return old;
        const isSuspending = userToUpdate.status === "active";
        return {
          ...old,
          data: old.data.map((user) =>
            user._id === userId
              ? {
                ...user,
                status: user.status === "active" ? "suspended" : "active",
              }
              : user
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
    onError: (err, userId, context) => {
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
