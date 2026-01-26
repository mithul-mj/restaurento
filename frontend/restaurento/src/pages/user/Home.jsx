import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Filter,
  Star,
  MapPin,
  ChevronDown,
  X,
  LocateFixed,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import userService from "../../services/user.service";
import FilterModal from "./FilterModal";
import useDebounce from "../../hooks/useDebounce";
import { showError } from "../../utils/alert";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500&auto=format&fit=crop";

const RestaurantCard = React.memo(({ item }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getOptimizedImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.includes("unsplash.com")) {
      return `${url}&w=500&q=80&auto=format&fit=crop`;
    }
    return url;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col will-change-transform">
      <div className="relative h-48 w-full overflow-hidden shrink-0 bg-gray-200">
        <img
          src={getOptimizedImageUrl(item.images?.[0])}
          alt={item.restaurantName}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover hover:scale-110 transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
        />
        <div
          className={`absolute top-4 right-4 ${item.isCurrentlyOpen ? "bg-green-500" : "bg-red-500"
            } text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}
        >
          {item.isCurrentlyOpen ? "OPEN" : "CLOSED"}
        </div>

        {item.distanceFromUser !== undefined && item.distanceFromUser !== null && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <MapPin size={10} className="text-[#ff9500]" />
            <span>
              {item.distanceFromUser < 1000
                ? `${Math.round(item.distanceFromUser)} m`
                : `${(item.distanceFromUser / 1000).toFixed(1)} km`}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
            {item.restaurantName}
          </h4>
          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
            <span>{item.ratingStats?.average || "New"}</span>
            <Star size={10} fill="currentColor" />
          </div>
        </div>

        <p className="text-xs text-gray-400 font-medium mb-3">
          ({item.ratingStats?.count || 0} ratings)
        </p>

        <p className="text-sm text-gray-600 mb-4 line-clamp-1">
          {item.tags?.join(", ") || "Clasical"}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-gray-400" />
            <span className="line-clamp-1 max-w-[100px]">
              {item.address || "Unknown"}
            </span>
          </div>
          <div className="font-semibold text-gray-700">
            ${item.slotPrice || 3}/slot
          </div>
        </div>
      </div>
    </div>
  );
});

const SkeletonCard = React.memo(() => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
    <div className="h-48 w-full bg-gray-200 animate-pulse shrink-0" />
    <div className="p-5 flex flex-col flex-1 gap-3">
      <div className="flex justify-between items-start">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-12 animate-pulse" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      <div className="mt-auto h-10 border-t border-gray-50 pt-4 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
    </div>
  </div>
));

const Home = () => {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [activeFilter, setActiveFilter] = useState("Filters");
  const [searchQuery, setSearchQuery] = useState("");
  const [columns, setColumns] = useState(3);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const locationWrapperRef = useRef(null);

  const debouncedLocationQuery = useDebounce(locationQuery, 200);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Detected:", latitude, longitude);
        setSelectedCoordinates({ lat: latitude, lon: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocationQuery(data.display_name);
        } catch (error) {
          setLocationQuery("Current Location");
        }
        setShowLocationDropdown(false);
      }, (error) => {
        console.error("Error detecting location", error);
        showError("Geolocation error", "Unable to detect location.");
      });
    } else {
      showError("Geolocation error", "Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationWrapperRef.current && !locationWrapperRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (debouncedLocationQuery && debouncedLocationQuery.length > 2) {
        try {
          // Using OpenStreetMap Nominatim API for free geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedLocationQuery)}&limit=5&addressdetails=1`
          );
          const data = await response.json();
          setLocationSuggestions(data);
          setShowLocationDropdown(true);
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      } else {
        setLocationSuggestions([]);
        setShowLocationDropdown(false);
      }
    };

    fetchLocations();
  }, [debouncedLocationQuery]);

  const handleLocationSelect = (place) => {
    setLocationQuery(place.display_name);
    setShowLocationDropdown(false);
    setSelectedCoordinates({ lat: place.lat, lon: place.lon });
    console.log("Selected Location:", { lat: place.lat, lon: place.lon });
  };

  const parentRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setColumns(1);
      else if (window.innerWidth < 1024) setColumns(2);
      else setColumns(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onSearch = (data) => {
    setSearchQuery(data.query);
  };

  const filters = ["Filters", "Open Now", "Rating 4.5+"];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["restaurants", searchQuery, appliedFilters, selectedCoordinates],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const limit = columns * 4;
      const res = await userService.getDashboard(pageParam, limit, searchQuery, appliedFilters, selectedCoordinates);
      return {
        results: res.restaurants,
        nextPage: res.pagination.hasNextPage ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const allRestaurants = useMemo(
    () => (data ? data.pages.flatMap((p) => p.results) : []),
    [data]
  );

  const isLoadingInitial = isLoading && !data;

  const rows = useMemo(() => {
    const r = ["HEADER"];
    if (isLoadingInitial) {
      r.push("SKELETON", "SKELETON");
    } else {
      for (let i = 0; i < allRestaurants.length; i += columns) {
        r.push(allRestaurants.slice(i, i + columns));
      }
    }
    return r;
  }, [allRestaurants, columns, isLoadingInitial]);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (index === 0 ? 650 : 380),
    overscan: 3,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const lastRowIndex =
    virtualRows.length > 0 ? virtualRows[virtualRows.length - 1].index : null;

  useEffect(() => {
    if (
      !isLoadingInitial &&
      lastRowIndex !== null &&
      lastRowIndex >= rows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [lastRowIndex, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage, isLoadingInitial]);

  return (
    <div className="h-screen flex flex-col bg-[#fcfcfc] overflow-hidden">
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualRows.map((virtualRow) => {
            const isHeader = virtualRow.index === 0;
            const isLoader = virtualRow.index === rows.length;
            const rowItems = rows[virtualRow.index];

            if (!rowItems && !isLoader) return null;

            if (isHeader) {
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    zIndex: 50, // Ensure header is above other rows for dropdown visibility
                  }}
                >
                  <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 group bg-gray-200">
                      <img
                        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
                        alt="Hero Banner"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 md:p-10">
                        <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
                          50% OFF on Weekend Orders
                        </h2>
                      </div>
                    </div>

                    <div className="w-full max-w-4xl mx-auto -mt-14 relative z-10 mb-10 px-2">
                      <form
                        onSubmit={handleSubmit(onSearch)}
                        className="relative flex flex-col md:flex-row shadow-xl shadow-gray-200/50 rounded-xl bg-white max-w-4xl mx-auto border border-gray-100"
                        style={{ zIndex: 50 }}
                      >
                        <div
                          ref={locationWrapperRef}
                          className="relative flex items-center md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 px-4 py-3 md:py-4 transition-colors rounded-l-xl z-20"
                        >
                          <MapPin className="text-[#ff9500] mr-3 shrink-0" size={22} />
                          <input
                            type="text"
                            placeholder="Detecting location..."
                            value={locationQuery}
                            onChange={(e) => {
                              setLocationQuery(e.target.value);
                              if (e.target.value.length === 0) setShowLocationDropdown(true);
                            }}
                            onFocus={() => {
                              setShowLocationDropdown(true);
                            }}
                            className="w-full bg-transparent focus:outline-none text-gray-700 font-medium placeholder-gray-400 text-base"
                          />
                          <ChevronDown className="text-gray-400 ml-2 shrink-0 cursor-pointer" size={16} onClick={() => setShowLocationDropdown(!showLocationDropdown)} />

                          {showLocationDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                              <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45 z-10"></div>

                              <div className="p-0 relative z-20 bg-white">
                                <button
                                  type="button"
                                  onClick={handleDetectLocation}
                                  className="w-full text-left px-4 py-4 hover:bg-gray-50 flex items-start gap-4 transition-colors group border-b border-gray-50"
                                >
                                  <div className="mt-0.5 text-red-500">
                                    <LocateFixed className="fill-transparent" size={18} style={{ strokeWidth: 2.5 }} />
                                  </div>
                                  <div>
                                    <div className="text-red-500 font-medium text-[15px]">Detect current location</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Using GPS</div>
                                  </div>
                                </button>

                                {locationSuggestions.length > 0 && (
                                  <>
                                    <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider mt-2 border-t border-gray-50 pt-2">
                                      Suggested Locations
                                    </div>
                                    {locationSuggestions.map((place, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleLocationSelect(place)}
                                        className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-lg flex items-start gap-3 transition-colors group"
                                      >
                                        <div className="mt-1 p-1.5 bg-gray-100 text-gray-400 rounded-full group-hover:bg-orange-100 group-hover:text-[#ff9500] transition-colors">
                                          <MapPin size={14} />
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                            {place.display_name.split(',')[0]}
                                          </div>
                                          <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                            {place.display_name}
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex items-center px-4 py-3 md:py-4 relative z-0">
                          <input
                            type="text"
                            placeholder="Search for restaurant, cuisine or a dish"
                            className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-base"
                            {...register("query")}
                          />
                          {watch("query") && (
                            <button
                              type="button"
                              onClick={() => setValue("query", "")}
                              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="px-6 py-3 md:py-4 transition-colors flex items-center justify-center text-gray-400 hover:text-[#ff9500]"
                        >
                          <Search size={22} className="stroke-[2.5px]" />
                        </button>
                      </form>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                      {filters.map((filter) => (
                        <button
                          key={filter}
                          onClick={() => {
                            if (filter === "Filters") {
                              setIsFilterModalOpen(true);
                            } else {
                              setActiveFilter(filter);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                                        ${activeFilter === filter && filter !== "Filters"
                              ? "bg-[#ffe8d6] text-[#ff5e00] border-[#ff5e00]"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }
                                    `}
                        >
                          {filter === "Filters" && (
                            <Filter size={14} className="inline mr-1.5" />
                          )}
                          {filter}
                        </button>
                      ))}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      Restaurants Near You
                    </h3>
                  </main>
                </div>
              );
            } else if (isLoader) {
              if (isLoadingInitial) return null;

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex justify-center items-center"
                >
                  <div className="text-gray-500 font-medium">Loading more...</div>
                </div>
              );
            } else if (rowItems === "SKELETON") {
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div
                      className="grid gap-6 md:gap-8"
                      style={{
                        gridTemplateColumns: `repeat(${columns}, 1fr)`
                      }}
                    >
                      {Array.from({ length: columns }).map((_, idx) => (
                        <SkeletonCard key={idx} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div
                      className="grid gap-6 md:gap-8"
                      style={{
                        gridTemplateColumns: `repeat(${columns}, 1fr)`
                      }}
                    >
                      {Array.isArray(rowItems) && rowItems.map((item) => (
                        <RestaurantCard key={item._id} item={item} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
        {!isLoadingInitial && allRestaurants.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No restaurants found.
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setIsFilterModalOpen(false);

        }}

      />
    </div>
  );
};

export default Home;
