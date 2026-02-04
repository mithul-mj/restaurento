import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Users,
  UserX,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { showConfirm } from "../../utils/alert";

const UserManagement = () => {
  const { register, handleSubmit, control, setValue } = useForm();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");

  const searchValue = useWatch({ control, name: "search", defaultValue: "" });

  const { data, isLoading, isError, toggleStatus } = useUsers({
    page,
    limit: 6,
    search,
    sortBy,
    status: statusFilter,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading users</p>;

  const { data: users, meta } = data;

  const onSearch = (data) => {
    setSearch(data.search);
    setPage(1);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">All Users</h2>
        <p className="text-gray-500 text-sm">
          Manage all active and inactive users on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="bg-[#fff5eb] text-[#ff5e00] w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              All Users
            </p>
            <h3 className="text-3xl font-bold text-gray-900">
              {meta.totalCount}
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              Total registered users
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="bg-[#fff5f5] text-red-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <UserX size={20} />
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              Suspended Users
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



      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <form
          onSubmit={handleSubmit(onSearch)}
          className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search by username, email"
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
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="flex items-center gap-4 w-full md:col-span-5">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img
                  src={
                    user.avatar ||
                    "https://ui-avatars.com/api/?name=" + user.fullName
                  }
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900">
                  {user.fullName}
                </h4>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500 text-xs truncate">
                      {user.email}
                    </p>
                    {user.isEmailVerified ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        Unverified
                      </span>
                    )}
                  </div>
                  {user.location?.address && (
                    <div className="flex items-center gap-1.5 md:hidden text-gray-500">
                      <MapPin size={12} className="text-[#ff5e00]" />
                      <span className="text-xs font-medium truncate max-w-[200px]">
                        {user.location.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center md:col-span-4">
              {user.location?.address ? (
                <div className="flex items-start gap-2 group">
                  <div className="p-1.5 rounded-md bg-gray-50 text-gray-400 group-hover:bg-[#fff5eb] group-hover:text-[#ff5e00] transition-colors">
                    <MapPin size={14} />
                  </div>
                  <span
                    className="text-xs font-medium text-gray-600 line-clamp-2"
                    title={user.location.address}>
                    {user.location.address}
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
                                    ${user.status === "active"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                  }
                                `}>
                {user.status}
              </span>

              <button
                onClick={() => {
                  showConfirm(
                    user.status === "active" ? "Suspend User?" : "Activate User?",
                    `Are you sure you want to ${user.status === "active" ? "suspend" : "activate"
                    } ${user.fullName}?`,
                    user.status === "active" ? "Yes, Suspend" : "Yes, Activate"
                  ).then((result) => {
                    if (result.isConfirmed) {
                      toggleStatus(user._id);
                    }
                  });
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors
                                    ${user.status === "active"
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                  }
                                `}
              >
                {user.status === "active" ? "Suspend" : "activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <p className="text-xs text-gray-500">
          Showing page{" "}
          <span className="font-bold text-gray-900">
            {meta.currentPage}
          </span>{" "}
          of{" "}
          <span className="font-bold text-gray-900">{meta.totalPages}</span>
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
              setPage((p) => (p < meta.totalPages ? p + 1 : p))
            }
            disabled={page >= meta.totalPages}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
};

export default UserManagement;
