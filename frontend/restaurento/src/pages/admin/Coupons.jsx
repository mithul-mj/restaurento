import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar, ChevronDown, Ticket, Gift, Timer, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, X, Tag } from "lucide-react";

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
        <>



            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">Manage Coupons</h1>
                    <p className="text-gray-500 mt-1 font-medium opacity-80">Oversee and modify all promotional campaigns and discounts.</p>
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
                            Currently Live
                        </div>
                    </div>
                    <div className="mt-auto">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1.5">Active Coupons</p>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{stats.activeCoupons}</h3>
                    </div>

                </div>



                {/* Expiring Soon Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                            <Timer size={24} />
                        </div>
                        <div className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {stats.expiringThisWeek} expiring soon
                        </div>
                    </div>
                    <div className="mt-auto">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1.5">Expiring This Week</p>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{stats.expiringThisWeek}</h3>
                    </div>

                </div>
            </div>

            {/* Filter Row Standardized */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5e00] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by coupon code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#ff5e00] focus:bg-white transition-all outline-none"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all font-bold"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    <div className="relative min-w-[180px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap pr-10 cursor-pointer focus:outline-none focus:border-[#ff5e00]"
                        >
                            <option>Filter Status</option>
                            <option>Active</option>
                            <option>Expired</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>

                    <div className="relative min-w-[180px]">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap pr-10 cursor-pointer focus:outline-none focus:border-[#ff5e00]"
                        >
                            <option>Sort By</option>
                            <option>Newest</option>
                            <option>Oldest</option>
                            <option>Discount High to Low</option>
                            <option>Discount Low to High</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Coupons Card List */}
            <div className="space-y-4 mb-10">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-24"></div>
                    ))
                ) : coupons.length > 0 ? (
                    coupons.map((coupon) => (
                        <div key={coupon._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                            {/* Left: Code & Info */}
                            <div className="flex items-center gap-4 md:col-span-5">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ff5e00] flex items-center justify-center shrink-0">
                                    <Tag size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-lg font-bold text-gray-900 tracking-tight leading-none mb-1">{coupon.code}</h4>
                                    <p className="text-xs text-gray-500 font-medium line-clamp-1">{coupon.discountDesc}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{coupon.discount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Usage & Validity */}
                            <div className="md:col-span-4 flex items-center gap-8 pl-0 md:pl-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Validity</span>
                                    <span className="text-sm font-bold text-gray-900 leading-none">{coupon.validityDate}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Status Info</span>
                                    <span className={`text-[11px] font-bold ${coupon.validityInfo === 'Expired' ? 'text-red-500' : 'text-gray-500'}`}>{coupon.validityInfo}</span>
                                </div>
                            </div>

                            {/* Right: Status & Actions */}
                            <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 border-t md:border-0 pt-4 md:pt-0">
                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${coupon.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {coupon.status}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingCoupon(coupon.raw)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/coupons/${coupon._id}`)}
                                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all" title="View">
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[32px] border border-gray-100 p-20 text-center shadow-inner bg-gray-50/20">
                        <Tag size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No campaigns recorded</h3>
                        <p className="text-gray-500 text-sm font-medium">Create your first promotional campaign to boost your platform growth.</p>
                    </div>
                )}
            </div>

            {/* Pagination Standardized */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-gray-100">
                <div className="text-xs md:text-sm font-medium text-gray-500 order-2 sm:order-1">
                    Showing <span className="font-bold text-gray-900">{pagination.totalCoupons === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1}-{Math.min(page * PAGE_LIMIT, pagination.totalCoupons)}</span> of <span className="font-bold text-gray-900">{pagination.totalCoupons}</span> campaigns
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all font-bold text-sm shadow-sm">
                        Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-4">Page {page} of {pagination.totalPages || 1}</span>
                    <button
                        onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                        disabled={page === pagination.totalPages || pagination.totalPages === 0}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all font-bold text-sm shadow-sm">
                        Next
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
        </>
    );
};


export default Coupons;
