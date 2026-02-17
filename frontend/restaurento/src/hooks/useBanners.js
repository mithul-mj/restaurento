import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import bannerService from "../services/banner.service.js";
import { showToast, showError } from "../utils/alert";

export const useBanners = ({ page = 1, limit = 10 } = {}) => {
    const queryClient = useQueryClient();
    const queryKey = ["banners", page, limit];

    // Query to fetch banners
    const query = useQuery({
        queryKey,
        queryFn: () => bannerService.getBanners(page, limit),
        placeholderData: keepPreviousData,
    });

    // Mutation to create a banner
    const createBannerMutation = useMutation({
        mutationFn: (formData) => bannerService.createBanner(formData),
        onSuccess: () => {
            showToast("Banner Created Successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        },
        onError: (err) => {
            showError("Creation Failed", err.message || "Failed to create banner");
        },
    });

    // Mutation to update a banner
    const updateBannerMutation = useMutation({
        mutationFn: ({ id, formData }) => bannerService.updateBanner(id, formData),
        onSuccess: () => {
            showToast("Banner Updated Successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        },
        onError: (err) => {
            showError("Update Failed", err.message || "Failed to update banner");
        },
    });

    // Mutation to toggle banner status
    const toggleStatusMutation = useMutation({
        mutationFn: (id) => bannerService.toggleBannerStatus(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((banner) =>
                        banner._id === id
                            ? { ...banner, isActive: !banner.isActive }
                            : banner
                    ),
                };
            });

            return { previousData };
        },
        onError: (err, id, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
            showError("Update Failed", err.message || "Failed to update banner status");
        },
        onSuccess: () => {
            showToast("Banner Status Updated", "success");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Mutation to delete a banner
    const deleteBannerMutation = useMutation({
        mutationFn: (id) => bannerService.deleteBanner(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.filter((banner) => banner._id !== id),
                };
            });

            return { previousData };
        },
        onError: (err, id, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
            showError("Delete Failed", err.message || "Failed to delete banner");
        },
        onSuccess: () => {
            showToast("Banner Deleted Successfully", "success");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        },
    });

    return {
        ...query,
        createBanner: createBannerMutation.mutate,
        isCreating: createBannerMutation.isPending,
        updateBanner: updateBannerMutation.mutate,
        isUpdating: updateBannerMutation.isPending,
        toggleStatus: toggleStatusMutation.mutate,
        deleteBanner: deleteBannerMutation.mutate,
    };
};
