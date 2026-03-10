import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRestaurantBookings } from "../../hooks/useRestaurantBookings";
import useDebounce from "../../hooks/useDebounce";
import Loader from "../../components/Loader";
import { formatDate, formatTime12Hour } from "../../utils/timeUtils";

const statusTabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useRestaurantBookings({
    page,
    limit: 6,
    status: activeTab,
    search: debouncedSearch,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const bookings = data?.data || [];
  const meta = data?.meta || { totalCount: 0, currentPage: 1, totalPages: 1 };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 font-medium">
          Manage and track all your restaurant reservations.
        </p>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-6 justify-between items-center bg-white">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 group-hover:bg-gray-100/80"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
              size={20}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-20 flex justify-center"
              >
                <Loader size="medium" />
              </motion.div>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 group hover:bg-gray-50/50 transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-6"
                >
                  <div className="md:col-span-4 space-y-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {booking.user?.fullName}
                    </h3>
                    <div className="flex flex-col text-sm font-medium text-gray-500">
                      <span>{formatDate(booking.bookingDate)} @ {formatTime12Hour(booking.slotTime)}</span>
                      <span>{booking.guests} Guests</span>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex flex-col items-start gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      Pre-order: {booking.preOrderItems?.length > 0
                        ? booking.preOrderItems.map(item => `${item.qty}x ${item.name}`).join(", ")
                        : "None"}
                    </span>
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      onClick={() => navigate(`/restaurant/bookings/${booking._id}`)}
                      className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-20 text-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No bookings found</h3>
                <p className="text-gray-500 font-medium">
                  Try changing your search or filter.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-white border-t border-gray-50 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="font-bold text-gray-900">{((page - 1) * 6) + 1}</span> to{" "}
            <span className="font-bold text-gray-900">{Math.min(page * 6, meta.totalCount)}</span> of{" "}
            <span className="font-bold text-gray-900">{meta.totalCount}</span> bookings
          </p>
          <div className="flex gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-orange-600 hover:border-orange-200 disabled:opacity-40 disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-orange-600 hover:border-orange-200 disabled:opacity-40 disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
