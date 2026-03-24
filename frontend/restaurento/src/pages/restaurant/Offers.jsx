import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, ChevronDown, Ticket, Gift, Timer, Pencil, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useOffers } from "../../hooks/useOffers";
import useDebounce from "../../hooks/useDebounce";
import PageLoader from "../../components/PageLoader";
import CreateOfferModal from "../../components/restaurant/modals/CreateOfferModal";
import { showConfirm } from "../../utils/alert";


const PAGE_LIMIT = 2; // Matches Admin side exactly

const Offers = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [sortBy, setSortBy] = useState("Sort By");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);

    const { data, isLoading, createOffer, isCreating, updateOffer, isUpdating, toggleOffer, deleteOffer } = useOffers({
        page, 
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        status: statusFilter,
        sortBy
    });

    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter, sortBy]);

    const handleDelete = async (id) => {
        const result = await showConfirm(
            "Delete Offer?",
            "This action cannot be undone and will stop this promotion immediately.",
            "Yes, Delete"
        );
        if (result.isConfirmed) deleteOffer(id);
    };


    const handleCreateOrUpdate = (formData) => {
        if (editingOffer) {
            updateOffer({ id: editingOffer._id, data: formData }, {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditingOffer(null);
                }
            });
        } else {
            createOffer(formData, {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditingOffer(null);
                }
            });
        }
    };

    const offers = data?.data || [];
    const stats = data?.stats || { activeCampaigns: 0, totalClaims: 0 };
    const pagination = data?.meta || { totalPages: 1, totalCount: 0 };
    
    // Check if we are performing any mutation
    const isWorking = isCreating || isUpdating;

    if (isLoading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">Manage Promotions</h1>
                    <p className="text-gray-500 mt-1 font-medium opacity-80">Create and track automatic discounts for your restaurant.</p>
                </div>

                <button
                    onClick={() => { setEditingOffer(null); setIsCreateOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-[#ff5e00] hover:bg-[#e05200] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap">
                    <Plus size={18} />
                    <span>Create New Offer</span>
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-green-50 rounded-xl text-green-500 group-hover:scale-110 transition-transform">
                            <Ticket size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Campaigns</p>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mt-0.5">{stats.activeCampaigns}</h3>
                        </div>

                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-red-50 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                            <Timer size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Claims</p>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mt-0.5">
                                {stats.totalClaims}
                            </h3>
                        </div>

                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5e00] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search offers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all font-bold"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-40">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 hover:border-gray-300 transition-all cursor-pointer">
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Paused</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative flex-1 lg:w-40">
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 hover:border-gray-300 transition-all cursor-pointer">
                            <option>Sort By</option>
                            <option>Newest</option>
                            <option>Oldest</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAF9F8] border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                <th className="py-4 px-6">Offer Value</th>
                                <th className="py-4 px-6">Validity</th>
                                <th className="py-4 px-6">Usage Progress</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {offers.length > 0 ? (
                                offers.map((offer) => {
                                    const progress = Math.min((offer.usedCount / offer.usageLimit) * 100, 100);
                                    const isExpired = offer.validUntil && new Date(offer.validUntil).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
                                    return (
                                        <tr key={offer._id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-bold text-gray-900">Flat ₹{offer.discountValue} OFF</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">Min Bill: ₹{offer.minOrderValue}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-800">{new Date(offer.validFrom).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">Ends: {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'Forever'}</div>
                                            </td>
                                            <td className="py-4 px-6 min-w-[180px]">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        <span>{offer.usedCount} Claimed</span>
                                                        <span>{offer.usageLimit} Limit</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-700 ${progress > 80 ? 'bg-orange-600' : 'bg-orange-400'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border 
                                                        ${isExpired ? 'bg-red-50 border-red-100 text-red-600' : 
                                                          offer.isActive ? 'bg-orange-50 border-orange-100 text-[#ff5e00]' : 
                                                          'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500' : offer.isActive ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                                                        {isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Paused'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-end gap-3">
                                                    {!isExpired && (
                                                        <button 
                                                            onClick={() => toggleOffer(offer._id)}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${offer.isActive ? 'bg-[#ff5e00]' : 'bg-gray-200'}`}
                                                            title={offer.isActive ? "Pause" : "Resume"}>
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${offer.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => { setEditingOffer(offer); setIsCreateOpen(true); }}
                                                        className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                                        title="Edit">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(offer._id)}
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                        title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-400 font-medium">No promotions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500 space-x-1">
                        Showing <span className="font-bold text-gray-900">{(page - 1) * PAGE_LIMIT + 1}-{Math.min(page * PAGE_LIMIT, pagination.totalCount)}</span> of <span className="font-bold text-gray-900">{pagination.totalCount}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-95">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-medium text-gray-700 px-2">Page {page} of {pagination.totalPages || 1}</span>
                        <button
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page === pagination.totalPages}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-95">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <CreateOfferModal
                isOpen={isCreateOpen}
                initialData={editingOffer}
                onClose={() => { setIsCreateOpen(false); setEditingOffer(null); }}
                onCreate={handleCreateOrUpdate}
                isCreating={isWorking}
            />
        </div>
    );
};

export default Offers;
