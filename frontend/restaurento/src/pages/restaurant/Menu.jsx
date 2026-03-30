import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import useMenu from "../../hooks/useMenu";
import useDebounce from "../../hooks/useDebounce";
import AddDishModal from "../../components/modals/AddDishModal";



import { showConfirm, showToast } from "../../utils/alert";

const TABS = ["All", "Breakfast", "Lunch", "Dinner"];

export default function Menu() {
    const [activeTab, setActiveTab] = useState("All");
    const [search, setSearch] = useState("");
    const [page, setpage] = useState(1);
    const limit = 3;

    const [editingItem, setEditingItem] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    const { menu, isLoading, toggleAvailability, pagination, updateMenuItem, addMenuItem, deleteMenuItem } = useMenu({
        page,
        limit,
        search: debouncedSearch,
        category: activeTab
    });

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setpage(1);
    }
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setpage(1);
    }

    const handleToggleAvailability = async (item) => {
        const result = await showConfirm(
            "Change Availability",
            `Are you sure you want to make "${item.name}" ${item.isAvailable ? "unavailable" : "available"}?`,
            "Yes, Change"
        );

        if (result.isConfirmed) {
            try {
                await toggleAvailability(item._id);
                showToast(`${item.name} is now ${item.isAvailable ? "unavailable" : "available"}`, "success");
            } catch (error) {
                showToast("Failed to update availability", "error");
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
    };

    const handleDelete = async (item) => {
        const result = await showConfirm(
            "Delete Item?",
            `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
            "Yes, Delete"
        );
        if (result.isConfirmed) {
            try {
                await deleteMenuItem(item._id);
                showToast(`${item.name} deleted successfully`, "success");
            } catch (error) {
                showToast("Failed to delete item", "error");
            }
        }
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsAddModalOpen(false);
    };

    const handleSave = async (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("price", data.price);
        formData.append("description", data.description);

        if (Array.isArray(data.categories)) {
            data.categories.forEach((cat) => formData.append("categories", cat));
        } else if (data.category) {
            formData.append("categories", data.category);
        }

        if (data.image) {
            const imgFile = Array.isArray(data.image) ? data.image[0] : data.image;
            if (imgFile instanceof File) {
                formData.append("image", imgFile);
            }
        }

        if (editingItem) {
            try {
                await updateMenuItem({ itemId: editingItem._id, data: formData });
                showToast(`${data.name} updated successfully`, "success");
                handleCloseModal();
            } catch (error) {
                showToast("Failed to update item", "error");
                console.error("Failed to update item", error);
            }
        } else {
            try {
                await addMenuItem(formData);
                showToast(`${data.name} added successfully`, "success");
                handleCloseModal();
            } catch (error) {
                showToast("Failed to add item", "error");
                console.error("Failed to add item", error);
            }
        }
    };


    return (
        <div className="w-full animate-in fade-in duration-500 pb-16">
            <div className="md:sticky md:top-0 z-10 bg-gray-50 pt-2 pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daily Menus</h1>
                        <p className="text-sm text-gray-500">
                            Manage food item availability for breakfast, lunch, and dinner.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Item
                    </button>
                </div>

                <div className="relative mt-6 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="mt-6 flex gap-6 border-b border-gray-200 text-sm overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 whitespace-nowrap px-1 transition-all font-medium ${activeTab === tab
                                ? "border-b-2 border-orange-500 text-orange-600"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 min-h-[300px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-orange-500" size={32} />
                    </div>
                ) : (
                    <>
                        {menu.length === 0 && (
                            <div className="p-12 text-center text-sm text-gray-500">
                                No items found matching your search.
                            </div>
                        )}

                        {menu.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-16 w-16 rounded-lg object-cover shadow-sm bg-gray-100"
                                    />
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            {item.description}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-orange-600">
                                            ₹{item.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span
                                            className={
                                                item.isAvailable
                                                    ? "text-gray-700 font-medium hidden sm:inline"
                                                    : "text-gray-400 font-medium hidden sm:inline"
                                            }
                                        >
                                            {item.isAvailable ? "Available" : "Unavailable"}
                                        </span>
                                        <button
                                            onClick={() => handleToggleAvailability(item)}
                                            className={`h-5 w-9 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${item.isAvailable
                                                ? "bg-orange-500"
                                                : "bg-gray-200"
                                                }`}
                                        >
                                            <div
                                                className={`h-4 w-4 rounded-full bg-white shadow-sm transform transition duration-200 ease-in-out ${item.isAvailable ? "translate-x-4" : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                                    >
                                        <Pencil
                                            size={18}
                                        />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {pagination && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Showing <span className="font-bold text-gray-900">{((page - 1) * limit) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, pagination.totalCount)}</span> of <span className="font-bold text-gray-900">{pagination.totalCount}</span> results
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setpage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setpage((p) => Math.min(pagination.totalPages, p + 1))}
                            disabled={page >= pagination.totalPages}
                            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {(editingItem || isAddModalOpen) && (
                <AddDishModal
                    initialData={editingItem}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div >
    );
}
