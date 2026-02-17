import React, { useState } from "react";
import { Plus, Link as LinkIcon, Pencil, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useBanners } from "../../hooks/useBanners";
import { showConfirm } from "../../utils/alert";
import PageLoader from "../../components/PageLoader";

import CreateBannerModal from "../../components/admin/modals/CreateBannerModal";

const Banners = () => {
    const [page, setPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const limit = 2;

    const { data, isLoading, isCreating, createBanner, updateBanner, isUpdating, toggleStatus, deleteBanner } = useBanners({ page, limit });

    const banners = data?.data || [];
    const pagination = data?.pagination || {};

    const handleCreateFn = (formData) => {
        if (selectedBanner) {
            updateBanner({ id: selectedBanner._id, formData }, {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setSelectedBanner(null);
                }
            });
        } else {
            createBanner(formData, {
                onSuccess: () => {
                    setIsCreateOpen(false);
                }
            });
        }
    };

    const handleToggle = (banner) => {
        const action = banner.isActive ? "deactivate" : "activate";
        showConfirm(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Banner?`,
            `Are you sure you want to ${action} this banner?`
        ).then((result) => {
            if (result.isConfirmed) {
                toggleStatus(banner._id);
            }
        });
    };

    const handleDelete = (id) => {
        showConfirm("Delete Banner?", "Are you sure you want to delete this banner?").then((result) => {
            if (result.isConfirmed) {
                deleteBanner(id);
            }
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
        }
    };


    React.useEffect(() => {
        if (page > 1 && pagination?.totalPages < page) {
            setPage((prev) => Math.max(1, prev - 1));
        }
    }, [pagination?.totalPages, page]);

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">

            <div className="mb-8">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Website Banners</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage promotional banners visible on your website</p>
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#ff5e00] hover:bg-[#e05200] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Add New Banner</span>
                    </button>
                    <CreateBannerModal
                        isOpen={isCreateOpen}
                        onClose={() => {
                            setIsCreateOpen(false);
                            setSelectedBanner(null);
                        }}
                        onCreate={handleCreateFn}
                        isCreating={isCreating || isUpdating}
                        initialData={selectedBanner}
                    />
                </div>
            </div>


            <div className="space-y-6">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                        <div className="relative h-64 w-full bg-gray-100 group">
                            <img
                                src={banner.imageUrl}
                                alt={banner.title || "Banner preview"}
                                className="w-full h-full object-cover"
                            />


                            <div className="absolute top-4 right-4">
                                {banner.isActive && (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-green-200 shadow-sm">
                                        Active
                                    </span>
                                )}
                            </div>

                            <div className="absolute bottom-4 left-4">
                                <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                    {banner.title || "Live Preview"}
                                </span>
                            </div>
                        </div>


                        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-50 bg-white">

                            <div className="flex items-center gap-2 text-gray-500 text-sm w-full sm:w-auto overflow-hidden">
                                <LinkIcon size={16} className="shrink-0" />
                                <a href={banner.targetLink} target="_blank" rel="noopener noreferrer" className="truncate hover:text-[#ff5e00] transition-colors">
                                    {banner.targetLink || "No link"}
                                </a>
                            </div>


                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700 capitalize">visibility</span>
                                    <button
                                        onClick={() => handleToggle(banner)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5e00] focus:ring-offset-2 ${banner.isActive ? 'bg-[#ff5e00]' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${banner.isActive ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-gray-200 mx-2"></div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedBanner(banner);
                                            setIsCreateOpen(true);
                                        }}
                                        className="text-gray-400 hover:text-[#ff5e00] transition-colors p-1"
                                        title="Edit Banner"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Delete Banner"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        <ChevronLeft size={18} />
                        <span className="text-sm font-medium">Previous</span>
                    </button>

                    <div className="text-sm text-gray-500 font-medium">
                        Page {page} of {pagination.totalPages}
                    </div>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        <span className="text-sm font-medium">Next</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Banners;
