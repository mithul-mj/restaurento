import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Clock, ChefHat, Users, Wallet } from "lucide-react";
import { minutesToTime, formatTime12Hour } from "../../utils/timeUtils";
import { getImageUrl } from "../../utils/imageUtils";
import ImageGallery from "../shared/ImageGallery";
import MenuGrid from "../shared/MenuGrid";

// Day names constant - index determines the day (0=Monday, 1=Tuesday, etc.)
const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Step5Review = () => {
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext();

  const {
    images,
    menuItems: rawMenuItems,
    openingHours,
    tags,
    restaurantName,
    description,
    totalSeats,
    slotPrice,
  } = watch();

  const [activeTab, setActiveTab] = useState("Dinner");

  const days = openingHours?.days || [];

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const d = openingHours?.days || [];
    if (d.length > 0) {
      const firstOpen = d.findIndex((day) => !day.isClosed);
      if (firstOpen !== -1) return firstOpen;
    }
    return 0;
  });

  const [prevOpeningHours, setPrevOpeningHours] = useState(openingHours);
  if (openingHours !== prevOpeningHours) {
    setPrevOpeningHours(openingHours);
    const d = openingHours?.days || [];
    if (d.length > 0) {
      const firstOpen = d.findIndex((day) => !day.isClosed);
      if (firstOpen !== -1) {
        setSelectedDayIndex(firstOpen);
      }
    }
  }

  const displayTags =
    tags && tags.length > 0 ? tags : ["Fine Dining", "Authentic", "Romantic"];

  const menuItems = rawMenuItems || [];
  const filteredItems = menuItems.filter((item) => {
    const cats = item.categories || [item.category];
    return cats.includes(activeTab);
  });

  const previewUrls = (Array.isArray(images) ? images : [])
    .map(getImageUrl)
    .filter(Boolean);

  // ImageGallery component now handles fallbacks internally
  const displayImages = previewUrls;

  const selectedDay = days[selectedDayIndex];
  const slots = selectedDay?.generatedSlots || [];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 font-inter">
      <div className="space-y-6">
        <ImageGallery images={displayImages} />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="text-[#ff5e00]" size={20} />
                <h2 className="text-xl font-bold text-gray-900">
                  About {restaurantName || "The Restaurant"}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {displayTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full border border-orange-100">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                {description ||
                  "Experience culinary excellence with our carefully curated menu and ambiance. Join us for an unforgettable dining journey."}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Users className="text-[#ff5e00]" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Seating Capacity
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {totalSeats || 0} Seats
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Wallet className="text-[#ff5e00]" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Average Price
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      ₹{slotPrice || 0} / person
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-[#ff5e00]" size={20} />
                <h2 className="text-xl font-bold text-gray-900">
                  Opening Hours
                </h2>
              </div>
              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-orange-50 rounded-lg">
                    <Clock className="text-[#ff5e00]" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-2">
                      Weekly Schedule
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {days.map((day, i) => (
                        <p
                          key={i}
                          className={`flex justify-between text-xs ${day.isClosed ? "text-gray-400" : "text-gray-600"}`}>
                          <span className="font-medium w-16">
                            {DAY_NAMES[i].substring(0, 3)}
                          </span>
                          {day.isClosed ? (
                            <span className="italic">Closed</span>
                          ) : (
                            <span>
                              {formatTime12Hour(day.startTime)} -{" "}
                              {formatTime12Hour(day.endTime)}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Time Slots</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin">
                {days.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedDayIndex(index)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center p-3 min-w-[4rem] rounded-xl border transition-all ${selectedDayIndex === index
                        ? "border-[#ff5e00] bg-orange-50 text-[#ff5e00] shadow-sm"
                        : "border-transparent text-gray-400 hover:bg-gray-50"
                      }`}>
                    <span className="text-xs uppercase font-bold tracking-wider">
                      {DAY_NAMES[index].substring(0, 3)}
                    </span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 ${day.isClosed ? "bg-gray-200" : "bg-green-400"}`}></div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedDay?.isClosed ? (
                  <div className="col-span-full text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Closed on {DAY_NAMES[selectedDayIndex]}
                  </div>
                ) : slots.length > 0 ? (
                  slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 px-2 border border-gray-100 rounded-lg text-center text-sm font-medium text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ff5e00] cursor-pointer transition-colors shadow-sm">
                      {formatTime12Hour(slot.startTime)} -{" "}
                      {formatTime12Hour(slot.endTime)}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No slots generated
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex gap-2">
                {["Breakfast", "Lunch", "Dinner"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === tab
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <MenuGrid items={filteredItems} activeTab={activeTab} />
          </section>

          <div className="pt-6 mt-8 border-t border-gray-100">
            <div className="flex items-start gap-3 p-5 bg-orange-50 rounded-xl mb-4 border border-orange-100/50">
              <input
                type="checkbox"
                {...register("termsAccepted")}
                id="terms"
                className="mt-1 w-4 h-4 accent-[#ff5e00] cursor-pointer"
              />
              <div>
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-700 font-medium cursor-pointer leading-tight block">
                  I confirm that all the information provided is accurate and I
                  grant permission to verify my business details.
                </label>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Review;
