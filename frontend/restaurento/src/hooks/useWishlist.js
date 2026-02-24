import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import userService from '../services/user.service.js'
import { showToast, showError } from '../utils/alert.js'

export const useWishlist = ({ page, limit }) => {
    const queryClient = useQueryClient();
    const queryKey = ["wishlist", page, limit];

    const query = useQuery({
        queryKey,
        queryFn: () => userService.getWishlists(page, limit),
        placeholderData: keepPreviousData,
    });

    const removeMutation = useMutation({
        mutationFn: (id) => userService.removeFromWishlist(id),
        onSuccess: () => {
            showToast("Removed from wishlist", "success");
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
        onError: (err) => {
            showError("Failed to remove", err.message || "Something went wrong");
        }
    });

    return {
        ...query,
        removeItem: removeMutation.mutate,
    };
};