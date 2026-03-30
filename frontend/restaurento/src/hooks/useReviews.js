import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import userService from "../services/user.service";
import { showToast } from "../utils/alert";

export const useReviews = ({ id, page = 1, limit = 5 }) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["reviews", id, page, limit],
        queryFn: () => userService.getRestaurantReviews(id, page, limit),
        enabled: !!id,
        placeholderData: keepPreviousData,
    });

    // 2. Submit or update a review
    const submitReviewMutation = useMutation({
        mutationFn: (data) => userService.submitReview(data),
        onSuccess: (res) => {
            showToast(res.message, "success");
            // Invalidate the reviews list for this restaurant
            queryClient.invalidateQueries({ queryKey: ["reviews", id] });
            // Invalidate specific restaurant details to refresh the average rating/count immediately
            queryClient.invalidateQueries({ queryKey: ["restaurant", id] });
        },
        onError: (err) => {
            showToast(err.response?.data?.message || "Something went wrong", "error");
        }
    });

    return {
        ...query,
        submitReview: submitReviewMutation.mutate,
        isSubmitting: submitReviewMutation.isPending,
        getExistingReview: userService.getExistingReview,
    };
};

// Hook to check if current user has an existing review for a specific restaurant
export const useExistingReview = (id) => {
    return useQuery({
        queryKey: ["existingReview", id],
        queryFn: () => userService.getExistingReview(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 mins
    });
};
