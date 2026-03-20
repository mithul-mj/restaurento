import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar, ChevronDown, Ticket, Gift, Timer, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

import { useCoupons } from "../../hooks/useCoupons";
import useDebounce from "../../hooks/useDebounce";
import PageLoader from "../../components/PageLoader";
import CreateCouponModal from "../../components/admin/modals/CreateCouponModal";
import { showConfirm } from "../../utils/alert";

const PAGE_LIMIT = 2;

const Coupons = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const [statusFilter, setStatusFilter] = useState("Filter Status");
    const [sortBy, setSortBy] = useState("Sort By");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    // Derived values for API
    const apiStatus = statusFilter === "Filter Status" ? "All" : statusFilter;
    const apiSortBy = sortBy === "Sort By" ? "Newest" : sortBy;

    const { data, isLoading, createCoupon, isCreating, updateCoupon, isUpdating, deleteCoupon } = useCoupons({
        page, limit: PAGE_LIMIT, search: debouncedSearch, status: apiStatus, sortBy: apiSortBy
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter, sortBy]);

    const handleDelete = async (id) => {
        const result = await showConfirm(
            "Delete Coupon?",
            "Are you sure you want to delete this coupon? This action cannot be undone.",
            "Yes, Delete it"
        );
        if (result.isConfirmed) {
            deleteCoupon(id);
        }
    };

    const handleModalSubmit = (formData) => {
        if (editingCoupon) {
            updateCoupon(
                { id: editingCoupon._id, couponData: formData },
                { onSuccess: () => setEditingCoupon(null) }
            );
        } else {
            createCoupon(formData, {
                onSuccess: () => setIsCreateOpen(false)
            });
        }
    };

    const coupons = data?.data || [];
    const stats = data?.stats || { activeCoupons: 0, expiringThisWeek: 0 };
    const pagination = data?.pagination || { totalPages: 1, totalCoupons: 0 };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">


            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">Manage Coupons</h1>
                    <p className="text-gray-500 mt-1">Oversee and modify all promotional campaigns and discounts.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[#ff5e00] hover:bg-[#e05200] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap">
                    <Plus size={20} />
                    <span>Create New Coupon</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Active Coupons Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                            <Ticket size={24} />
                        </div>
                        <div className="bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            +2% this week
                        </div>
                    </div>
                    <div className="mt-auto">
                        <p className="text-gray-500 text-sm font-medium mb-1">Active Coupons</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stats.activeCoupons}</h3>
                    </div>
                </div>



                {/* Expiring Soon Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                            <Timer size={24} />
                        </div>
                        <div className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            5 expiring soon
                        </div>
                    </div>
                    <div className="mt-auto">
                        <p className="text-gray-500 text-sm font-medium mb-1">Expiring This Week</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stats.expiringThisWeek}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by coupon code..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e00] focus:bg-white transition-colors"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#ff5e00] cursor-pointer">
                            <option>Filter Status</option>
                            <option>Active</option>
                            <option>Expired</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>

                    <div className="relative flex-1 lg:flex-none">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#ff5e00] cursor-pointer">
                            <option>Sort By</option>
                            <option>Newest</option>
                            <option>Oldest</option>
                            <option>Discount High to Low</option>
                            <option>Discount Low to High</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>


                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAF9F8] border-b border-gray-100">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Coupon Code</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Validity</th>

                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {coupons.length > 0 ? (
                                coupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className={`inline-block border px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide
                                            ${coupon.status === 'Active'
                                                    ? 'bg-orange-50 border-orange-100 text-[#ff5e00]'
                                                    : 'bg-gray-100 border-gray-200 text-gray-600'}
                                        `}>
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-bold text-gray-900">{coupon.discount}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{coupon.discountDesc}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-800">{coupon.validityDate}</div>
                                            <div className={`text-xs mt-0.5 ${coupon.validityInfo === 'Expired' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                                {coupon.validityInfo}
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border 
                                            ${coupon.status === 'Active'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200'}
                                        `}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${coupon.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                {coupon.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-3 text-gray-400">
                                                <button
                                                    onClick={() => setEditingCoupon(coupon.raw)}
                                                    className="hover:text-gray-700 transition-colors" title="Edit">
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon._id)}
                                                    className="hover:text-red-600 transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/coupons/${coupon._id}`)}
                                                    className="hover:text-gray-700 transition-colors" title="View">
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">No coupons found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Component matching image */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                <div className="text-sm text-gray-500">
                    Showing <span className="font-bold text-gray-900">{pagination.totalCoupons === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1}-{Math.min(page * PAGE_LIMIT, pagination.totalCoupons)}</span> of <span className="font-bold text-gray-900">{pagination.totalCoupons}</span> results
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm">
                        <ChevronLeft size={18} />
                        Prev
                    </button>

                    <span className="text-sm font-medium text-gray-700 px-2">Page {page} of {pagination.totalPages || 1}</span>

                    <button
                        onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                        disabled={page === pagination.totalPages || pagination.totalPages === 0}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm">
                        Next
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <CreateCouponModal
                isOpen={isCreateOpen || !!editingCoupon}
                initialData={editingCoupon}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingCoupon(null);
                }}
                onCreate={handleModalSubmit}
                isCreating={isCreating || isUpdating}
            />
        </div>
    );
};

export default Coupons;
