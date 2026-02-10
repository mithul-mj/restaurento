import { useQuery, useQueryClient, useMutation, keepPreviousData } from '@tanstack/react-query'
import restaurantService from '../services/restaurant.service'
import { showToast, showError } from '../utils/alert'

const useMenu = ({ page, limit, search, category }) => {
    const queryClient = useQueryClient();
    const queryKey = ["restaurant-menu", page, limit, search, category];
    const { data, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn: () => restaurantService.getMenu({ page, limit, search, category }),
        placeholderData: keepPreviousData,
    })
    const toggleItemAvailabilityMutation = useMutation({
        mutationFn: (itemId) => restaurantService.toggleItemAvailability(itemId),
        onMutate: async (itemId) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old) => {
                if (!old) return old;

                const newData = { ...old };

                if (newData.data) {
                    newData.data = newData.data.map((item) => (
                        item._id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
                    ));
                }
                return newData;
            });
            return { previousData };
        },
        onError: (err, itemId, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
            showError("Failed to update status");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
        onSuccess: () => {
            showToast("Item status updated");
        }
    })

    const updateMenuItemMutation = useMutation({
        mutationFn: ({ itemId, data }) => restaurantService.updateMenuItem(itemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            showToast("Menu item updated successfully");
        },
        onError: (err) => {
            showError(err.response?.data?.message || "Failed to update item");
        }
    });

    const addMenuItemMutation = useMutation({
        mutationFn: (data) => restaurantService.addMenuItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            showToast("Menu item added successfully");
        },
        onError: (err) => {
            showError(err.response?.data?.message || "Failed to add item");
        }
    });

    const deleteMenuItemMutation = useMutation({
        mutationFn: (itemId) => restaurantService.deleteMenuItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            showToast("Menu item deleted successfully")
        },
        onError: (err) => {
            showError(err.response?.data?.message || "Failed to delete item");
        }
    })

    return {
        menu: data?.data || [],
        pagination: data?.meta || {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            perPage: 10
        },
        isLoading,
        isError,
        error,
        toggleAvailability: toggleItemAvailabilityMutation.mutate,
        updateMenuItem: updateMenuItemMutation.mutateAsync,
        addMenuItem: addMenuItemMutation.mutateAsync,
        deleteMenuItem: deleteMenuItemMutation.mutateAsync,
    };

}

export default useMenu;