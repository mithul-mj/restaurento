import api from "./api";

export const getBanners = async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/banners?page=${page}&limit=${limit}`);
    return response.data;
};

export const createBanner = async (formData) => {
    const response = await api.post("/admin/banners", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const updateBanner = async (id, formData) => {
    const response = await api.put(`/admin/banners/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const toggleBannerStatus = async (id) => {
    const response = await api.patch(`/admin/banners/${id}/toggle`);
    return response.data;
};

export const deleteBanner = async (id) => {
    const response = await api.delete(`/admin/banners/${id}`);
    return response.data;
};

const bannerService = {
    getBanners,
    createBanner,
    updateBanner,
    toggleBannerStatus,
    deleteBanner,
};

export default bannerService;
