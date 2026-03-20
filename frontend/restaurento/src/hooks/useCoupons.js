import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import couponService from "../services/coupon.service";
import { showToast, showError } from "../utils/alert";

export const useCoupons = ({ page = 1, limit = 10, search = "", status = "All", sortBy = "Newest" } = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ["coupons", page, limit, search, status, sortBy];

  const query = useQuery({
    queryKey,
    queryFn: () => couponService.getCoupons({ page, limit, search, status, sortBy }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (couponData) => couponService.createCoupon(couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      showToast("Coupon created successfully", "success");
    },
    onError: (err) => {
      showError("Creation Failed", err.response?.data?.message || err.message || "Failed to create coupon");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, couponData }) => couponService.updateCoupon(id, couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      showToast("Coupon updated successfully", "success");
    },
    onError: (err) => {
      showError("Update Failed", err.response?.data?.message || err.message || "Failed to update coupon");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      showToast("Coupon deleted successfully", "success");
    },
    onError: (err) => {
      showError("Delete Failed", err.response?.data?.message || err.message || "Failed to delete coupon");
    },
  });

  return {
    ...query,
    createCoupon: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateCoupon: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteCoupon: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};