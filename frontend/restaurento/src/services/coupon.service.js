import api from "./api";

export const getCoupons = async ({ page = 1, limit = 10, search = "", status = "All", sortBy = "Newest" }) => {
    const response = await api.get('/admin/coupons', {
        params: { page, limit, search, status, sortBy }
    });
    return response.data;
};

export const createCoupon = async (couponData) => {
    const response = await api.post("/admin/coupons", couponData);
    return response.data;
};

export const updateCoupon = async (id, couponData) => {
    const response = await api.put(`/admin/coupons/${id}`, couponData);
    return response.data;
};

export const deleteCoupon = async (id) => {
    const response = await api.delete(`/admin/coupons/${id}`);
    return response.data;
};

export const getCouponById = async (id) => {
    const response = await api.get(`/admin/coupons/${id}`);
    return response.data;
};

const couponService = {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponById,
};

export default couponService;
