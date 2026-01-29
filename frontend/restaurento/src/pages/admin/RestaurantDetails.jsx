import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Utensils,
  Lock,
  Phone,
  Mail,
  Clock,
  Download,
  AlertTriangle,
  Search,
  MapPin,
} from "lucide-react";
import ImageGallery from "../../components/shared/ImageGallery";
import MenuGrid from "../../components/shared/MenuGrid";
import TimeSlotViewer from "../../components/shared/TimeSlotViewer";
import adminService from "../../services/admin.service";
import LocationViewer from "../../components/shared/LocationViewer";
import { formatTime12Hour } from "../../utils/timeUtils";
import {
  showConfirm,
  showPrompt,
  showSuccess,
  showError,
} from "../../utils/alert";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const LockableSection = ({ children, isLocked }) => (
  <div className="relative">
    <div
      className={
        isLocked
          ? "filter blur-[3px] pointer-events-none select-none opacity-60"
          : ""
      }>
      {children}
    </div>
    {isLocked && (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[2px] rounded-2xl border-2 border-dashed border-gray-200">
        <div className="bg-white p-4 rounded-full shadow-xl mb-3">
          <Lock className="text-orange-500" size={24} />
        </div>
        <p className="text-sm font-bold text-gray-700">Content Locked</p>
        <p className="text-xs text-gray-500">
          Available after onboarding completion
        </p>
      </div>
    )}
  </div>
);

const RestaurantDetails = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeMenuTab, setActiveMenuTab] = useState("Dinner");

  const handleApprove = async () => {
    const result = await showConfirm(
      "Approve Restaurant",
      `Are you sure you want to approve ${data.restaurantName}? This will grant them full access to the platform.`,
      "Confirm Approval",
    );

    if (result.isConfirmed) {
      await updateVerificationStatus("approved");
    }
  };

  const handleReject = async () => {
    const result = await showPrompt(
      "Reject Application",
      "Please specify the reason for rejection:",
      "Reject Application",
    );

    if (result.isConfirmed && result.value) {
      await updateVerificationStatus("rejected", result.value);
    }
  };

  const updateVerificationStatus = async (status, reason = "") => {
    try {
      const response = await adminService.toggleRestaurantVerificationStatus(
        restaurantId,
        { verificationStatus: status, reason },
      );

      if (response?.user) {
        setData((prev) => ({
          ...prev,
          verificationStatus: response.user.verificationStatus,
          verificationHistory: response.user.verificationHistory,
          rejectionReason: response.user.rejectionReason,
        }));

        await showSuccess(
          status === "approved"
            ? "Approved Successfully"
            : "Application Rejected",
          `The restaurant application has been ${status}.`,
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showError("Action Failed", "Could not update verification status.");
    }
  };

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        const response = await adminService.getRestaurantDetails(restaurantId);
        if (response.user) {
          const fetchedData = {
            ...response.user,
            tags: response.user.tags || [],
            images: response.user.images || [],
            menu: response.user.menuItems || [],
            location: response.user.location || {
              type: "Point",
              coordinates: [0, 0],
            },
          };
          if (fetchedData.location.coordinates) {
            fetchedData.location = {
              lat: fetchedData.location.coordinates[1],
              lng: fetchedData.location.coordinates[0],
              ...fetchedData.location,
            };
          }

          setData(fetchedData);
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurantDetails();
    }
  }, [restaurantId]);

  const handleStatusToggle = async () => {
    try {
      showConfirm(
        data.status === "active" ? "Suspend Restaurant?" : "Activate Restaurant?",
        `Are you sure you want to ${data.status === "active" ? "suspend" : "activate"
        } ${data.restaurantName}?`,
        data.status === "active" ? "Yes, Suspend" : "Yes, Activate"
      ).then(async (result) => {
        if (result.isConfirmed) {
          const response = await adminService.toggleRestaurantStatus(
            restaurantId
          );
          if (response?.data?.user) {
            setData((prev) => ({
              ...prev,
              status: response.data.user.status,
            }));
            showSuccess(
              "Status Updated",
              `Restaurant has been ${response.data.user.status === "active"
                ? "activated"
                : "suspended"
              }.`
            );
          }
        }
      });
    } catch (error) {
      console.error("Error toggling status:", error);
      showError("Action Failed", "Could not update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading restaurant details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">Restaurant not found</p>
      </div>
    );
  }

  const menuItems = data.menu || [];
  const filteredItems = menuItems.filter((item) => {
    return item.categories.includes(activeMenuTab);
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-xs text-gray-400 space-x-2">
          <span
            onClick={() => navigate("/admin/restaurants")}
            className="hover:underline cursor-pointer">
            Back to Restaurants
          </span>
          <span>/</span>
          <span className="text-gray-600 font-medium">
            {data.restaurantName}
          </span>
        </div>
        <button
          onClick={handleStatusToggle}
          className={`px-5 py-1.5 rounded-lg text-xs font-bold transition ${data.status === "active"
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}>
          {data.status === "active" ? "Suspend" : "Activate"}
        </button>
      </div>

      <div className="flex items-center space-x-3 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {data.restaurantName}
        </h1>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {data.status}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Basic Information</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {data.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-[#ff5e00] mt-0.5" />
                <span className="text-sm text-gray-500">
                  Phone:{" "}
                  <span className="ml-1 text-gray-900 font-medium">
                    {data.restaurantPhone}
                  </span>
                </span>
              </div>

              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-[#ff5e00] mt-0.5" />
                <span className="text-sm text-gray-500">
                  Email:{" "}
                  <span className="ml-1 text-gray-900 font-medium">
                    {data.email}
                  </span>
                </span>
              </div>

              {data.isOnboardingCompleted &&
                data.openingHours &&
                data.openingHours?.days && (
                  <div className="flex items-start space-x-3">
                    <Clock
                      size={18}
                      className="text-[#ff5e00] mt-0.5 shrink-0"
                    />
                    <div className="text-xs space-y-1 w-full">
                      {data.openingHours?.days.map((day, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[3rem_1fr] gap-x-2 items-center">
                          <span className="font-medium text-gray-500">
                            {DAY_NAMES[i].substring(0, 3)}
                          </span>
                          {day.isClosed ? (
                            <span className="text-gray-400 italic">
                              Closed
                            </span>
                          ) : (
                            <span className="text-gray-900 font-medium">
                              {formatTime12Hour(day.startTime)} -{" "}
                              {formatTime12Hour(day.endTime)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {data.tags && (
              <div className="flex flex-wrap gap-3 mt-8">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-orange-50 text-[#cc4b00] px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-orange-100 transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>
          <LockableSection isLocked={!data.isOnboardingCompleted}>
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-6">Restaurant Visuals</h2>
              <ImageGallery images={data.images} />
            </section>
          </LockableSection>
          <LockableSection isLocked={!data.isOnboardingCompleted}>
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-6">
                Weekly Schedule & Slots
              </h2>
              <TimeSlotViewer days={data.openingHours?.days || []} />
            </section>
          </LockableSection>

          <LockableSection isLocked={!data.isOnboardingCompleted}>
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex gap-2">
                  {["Breakfast", "Lunch", "Dinner"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveMenuTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeMenuTab === tab
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <MenuGrid
                items={filteredItems}
                activeTab={activeMenuTab}
                emptyStateMessage="No menu items found"
              />
            </section>
          </LockableSection>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex items-start space-x-4">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-900">
                2 Active User Reports
              </h4>
              <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                Pending reports require your immediate attention.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
              Approval Status
            </h3>
            <div className="flex justify-between mb-8">
              <span className="text-sm text-gray-500 font-medium">
                Current Status
              </span>
              <span
                className={`font-bold text-sm capitalize ${data.verificationStatus === "approved"
                  ? "text-green-600"
                  : data.verificationStatus === "rejected"
                    ? "text-red-500"
                    : data.verificationStatus === "banned"
                      ? "text-slate-900"
                      : "text-orange-500"
                  }`}>
                {data.verificationStatus}
              </span>
            </div>

            {data.verificationStatus === "pending" &&
              (data.submissionAttempts || 0) <= 3 && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-200">
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    className="bg-white border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-xl text-xs font-bold transition-all">
                    Reject
                  </button>
                </div>
              )}
            <div className="md:col-span-1 border-l-2 border-gray-100 ml-1 pl-4 space-y-6 relative">
              {(data.verificationHistory || [])
                .slice()
                .reverse()
                .map((historyItem, index) => (
                  <div key={index} className="relative">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${historyItem.status === "approved"
                        ? "bg-green-500"
                        : historyItem.status === "rejected"
                          ? "bg-red-500"
                          : historyItem.status === "banned"
                            ? "bg-slate-900"
                            : "bg-orange-500"
                        }`}
                    />

                    <div>
                      <p
                        className={`text-xs font-bold capitalize ${historyItem.status === "approved"
                          ? "text-green-700"
                          : historyItem.status === "rejected"
                            ? "text-red-600"
                            : historyItem.status === "banned"
                              ? "text-slate-900"
                              : "text-orange-600"
                          }`}>
                        {historyItem.status}
                      </p>

                      {historyItem.reason && (
                        <p className="text-[11px] text-gray-600 mt-1 italic">
                          "{historyItem.reason}"
                        </p>
                      )}

                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(historyItem.date).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                ))}

              <div className="relative opacity-60">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-gray-400" />
                <p className="text-xs font-bold text-gray-800">
                  Application Created
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(data.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          <LockableSection isLocked={!data.isOnboardingCompleted}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                Seating & Rates
              </h3>
              <div className="space-y-4">
                {[
                  ["Total Seats", `${data.totalSeats || 0}`],
                  ["Booking Rate", `₹${data.slotPrice || 0} / person`],
                  [
                    "Slot Duration",
                    `${data.slotConfig?.duration || 0} Minutes`,
                  ],
                  ["Gap Duration", `${data.slotConfig?.gap || 0} Minutes`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-bold text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </LockableSection>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
              Legal Documents
            </h3>
            <div className="space-y-3">
              {Object.keys(data.documents || {}).map((doc) => (
                <div
                  key={doc}
                  onClick={() => window.open(data.documents[doc], "_blank")}
                  className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-orange-200 transition cursor-pointer">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Download size={16} className="text-orange-500" />
                    <span className="text-xs font-medium group-hover:text-orange-600 transition">
                      {doc}
                    </span>
                  </div>
                  <Download size={14} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
              Location
            </h3>
            <LocationViewer
              lat={data.location.lat}
              lng={data.location.lng}
            />
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              {data.address}
            </p>
            <p className="text-[10px] text-gray-400 mt-2 font-mono">
              Lat: {data.location.lat}, Lng: {data.location.lng}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
