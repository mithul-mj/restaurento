import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Store,
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useRestaurants } from "../../hooks/useRestaurants";
import Sidebar from "../../components/admin/Sidebar";

const RestaurantManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { register, handleSubmit, control, setValue } = useForm();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");

  const searchValue = useWatch({ control, name: "search", defaultValue: "" });

  const { data, isLoading, isError, toggleStatus } = useRestaurants({
    page,
    limit: 6,
    search,
    sortBy,
    status: statusFilter,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading restaurants</p>;

  // Ensure data structure matches what hook returns (data: { data: [], meta: {} })
  const { data: restaurants, meta } = data;

  const onSearch = (data) => {
    setSearch(data.search);
    setPage(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="Restaurants"
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-[#ff5e00] text-white p-1 rounded-md flex items-center justify-center">
              <span className="font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Restauranto</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500">
            <Menu size={24} />
          </button>
        </header>

        <main className="p-6 md:p-10 flex-1 overflow-x-hidden">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Restaurant Management
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <div className="bg-[#fff5eb] text-[#ff5e00] w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Store size={20} />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  All Restaurants
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {meta.totalCount}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Total registered restaurants
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <div className="bg-[#fff5f5] text-red-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Store size={20} />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  Suspended Restaurants
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {meta.suspendedCount}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Accounts with temporary restrictions
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Restaurants</h2>
            <p className="text-gray-500 text-sm">
              Manage all active and inactive restaurants on the platform.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <form
              onSubmit={handleSubmit(onSearch)}
              className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="Search by name, cuisine"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#ff5e00]"
                {...register("search")}
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("search", "");
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </form>

            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap pr-8 cursor-pointer focus:outline-none focus:border-[#ff5e00]">
                  <option value="newest">Sort by: Newest</option>
                  <option value="oldest">Sort by: Oldest</option>
                  <option value="a-z">Sort by: A-Z</option>
                  <option value="z-a">Sort by: Z-A</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap pr-8 cursor-pointer focus:outline-none focus:border-[#ff5e00]">
                  <option value="all">Status: All</option>
                  <option value="active">Status: Active</option>
                  <option value="suspended">Status: Suspended</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="flex items-center gap-4 w-full md:col-span-5">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <img
                      src={
                        restaurant.logo ||
                        "https://ui-avatars.com/api/?name=" +
                          (restaurant.restaurantName || "R")
                      }
                      alt={restaurant.restaurantName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900">
                      <Link
                        to={`/admin/restaurants/${restaurant._id}`}
                        className="hover:text-[#ff5e00] transition-colors">
                        {restaurant.restaurantName ||
                          "(Restaurant Name not set)"}
                      </Link>
                    </h4>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 text-xs font-medium truncate">
                          {restaurant.fullName}
                        </span>
                        <span className="text-gray-400 text-[10px]">•</span>
                        <p className="text-gray-500 text-xs truncate">
                          {restaurant.email}
                        </p>
                        {restaurant.isEmailVerified ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            Unverified
                          </span>
                        )}
                        {restaurant.isOnboardingCompleted ||
                        restaurant.isOnbordingCompleted ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                            Onboarding Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            Pending Onboarding
                          </span>
                        )}
                      </div>
                      {(restaurant.address || restaurant.location?.address) && (
                        <div className="flex items-center gap-1.5 md:hidden text-gray-500">
                          <MapPin size={12} className="text-[#ff5e00]" />
                          <span className="text-xs font-medium truncate max-w-[200px]">
                            {restaurant.address || restaurant.location?.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center md:col-span-4">
                  {restaurant.address || restaurant.location?.address ? (
                    <div className="flex items-start gap-2 group">
                      <MapPin
                        size={16}
                        className="text-gray-400 group-hover:text-[#ff5e00] transition-colors shrink-0 mt-0.5"
                      />
                      <span
                        className="text-xs font-medium text-gray-600 line-clamp-2"
                        title={
                          restaurant.address || restaurant.location?.address
                        }>
                        {restaurant.address || restaurant.location?.address}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic px-2">
                      Location not set
                    </span>
                  )}
                </div>

                <div className="w-full md:col-span-3 flex items-center justify-between md:justify-end gap-3 md:gap-8">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full
                                        ${
                                          restaurant.status === "active"
                                            ? "bg-green-50 text-green-600"
                                            : "bg-red-50 text-red-500"
                                        }
                                    `}>
                    {restaurant.status}
                  </span>

                  <Link
                    to={`/admin/restaurants/${restaurant._id}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#ff5e00] hover:bg-[#fff5eb] transition-colors"
                    title="View Details">
                    <Eye size={18} />
                  </Link>

                  <button
                    onClick={() => toggleStatus(restaurant._id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors
                                        ${
                                          restaurant.status === "active"
                                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                                            : "bg-green-50 text-green-600 hover:bg-green-100"
                                        }
                                    `}>
                    {restaurant.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-500">
              Showing page{" "}
              <span className="font-bold text-gray-900">
                {meta?.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {meta?.totalPages}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => (p < meta?.totalPages ? p + 1 : p))
                }
                disabled={page >= meta?.totalPages}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RestaurantManagement;
