import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import offerService from "../services/offer.service";
import { showToast, showError } from "../utils/alert";

export const useOffers = ({ page = 1, limit = 10, search, status, sortBy } = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ["offers", page, limit, search, status, sortBy];

  const query = useQuery({
    queryKey,
    queryFn: () => offerService.getMyOffers({ page, limit, search, status, sortBy }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (offerData) => offerService.createOffer(offerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      showToast("Offer created successfully", "success");
    },
    onError: (err) => {
      showError("Creation Failed", err.response?.data?.message || err.message || "Failed to create offer");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => offerService.updateOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      showToast("Offer updated successfully", "success");
    },
    onError: (err) => {
      showError("Update Failed", err.response?.data?.message || err.message || "Failed to update offer");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => offerService.toggleOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      showToast("Offer status updated", "info");
    },
    onError: (err) => {
      showError("Update Failed", err.response?.data?.message || err.message || "Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => offerService.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      showToast("Offer deleted successfully", "success");
    },
    onError: (err) => {
      showError("Delete Failed", err.response?.data?.message || err.message || "Failed to delete offer");
    },
  });

  return {
    ...query,
    createOffer: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateOffer: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    toggleOffer: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    deleteOffer: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
