import React from "react";
import {
  Search,
  Filter,
  MapPin,
  ChevronDown,
  X,
  LocateFixed,
  History,
} from "lucide-react";
import FilterModal from "./FilterModal";
import Loader from "../../components/Loader";
import RestaurantCard from "../../components/user/RestaurantCard";
import SkeletonCard from "../../components/user/SkeletonCard";
import BannerCarousel from "../../components/user/BannerCarousel";
import useHome from "./useHome";
import { useLocation } from "../../context/LocationContext";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

const Home = () => {
  const {
    register,
    watch,
    setValue,
    activeFilter,
    setActiveFilter,
    isFilterModalOpen,
    setIsFilterModalOpen,
    appliedFilters,
    setAppliedFilters,
    filters,
    showLocationDropdown,
    setShowLocationDropdown,
    locationWrapperRef,
    columns,
    parentRef,
    rowVirtualizer,
    virtualRows,
    rows,
    isLoadingInitial,
    allRestaurants,
    activeBanners,
    isLoadingBanners,
  } = useHome();

  const {
    locationQuery,
    setLocationQuery,
    locationSuggestions,
    isLocationModalOpen,
    setIsLocationModalOpen,
    selectedCoordinates,
    handleDetectLocation,
    handleLocationSelect,
    recentLocations,
    placeholderText,
  } = useLocation();

  const dragControls = useDragControls();

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] overflow-hidden">
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}>
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
                    zIndex: 50,
                  }}>
                  <main className="max-w-7xl mx-auto px-4 md:px-8 pt-1 pb-1">
                    <div className="-mx-4 md:mx-0">
                      <BannerCarousel
                        banners={activeBanners}
                        isLoading={isLoadingBanners}
                      />
                    </div>

                    <div className="sticky top-0 md:relative z-30 bg-[#fcfcfc]/95 backdrop-blur-lg -mx-4 px-4 pt-2 md:pt-0 md:bg-transparent md:backdrop-blur-none transition-all duration-300">
                      <div className="w-full max-w-4xl mx-auto mt-2 md:-mt-14 relative z-10 mb-4 md:px-2">
                        <div
                          className="relative flex flex-col md:flex-row shadow-xl shadow-gray-200/50 rounded-xl bg-white max-w-4xl mx-auto border border-gray-100"
                          style={{ zIndex: 50 }}>
                          {/* Desktop Location Input */}
                          <div
                            ref={locationWrapperRef}
                            className="hidden md:flex relative items-center md:w-1/3 border-r border-gray-100 px-4 py-4 transition-colors rounded-l-xl z-20">
                            <MapPin className="text-[#ff9500] mr-3 shrink-0" size={22} />
                            <input
                              type="text"
                              placeholder={placeholderText}
                              value={locationQuery}
                              onFocus={() => setShowLocationDropdown(true)}
                              onChange={(e) => {
                                setLocationQuery(e.target.value);
                                if (!showLocationDropdown) setShowLocationDropdown(true);
                              }}
                              className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-base"
                            />
                            <ChevronDown
                              size={16}
                              className={`text-gray-400 ml-1 transition-transform duration-200 cursor-pointer ${showLocationDropdown ? "rotate-180" : ""}`}
                              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                            />

                            {showLocationDropdown && (
                              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 py-1 min-w-[280px]">
                                <button
                                  onClick={() => {
                                    handleDetectLocation();
                                    setShowLocationDropdown(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group border-b border-gray-50">
                                  <div className="text-red-500 group-hover:scale-110 transition-transform">
                                    <LocateFixed size={18} />
                                  </div>
                                  <div>
                                    <div className="text-red-500 font-semibold text-sm">Detect current location</div>
                                    <div className="text-[10px] text-gray-400">Using GPS</div>
                                  </div>
                                </button>

                                {locationSuggestions.length > 0 ? (
                                  <>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-2 flex items-center gap-2">
                                      <span className="w-4 h-[1px] bg-gray-100"></span>
                                      Suggestions
                                    </div>
                                    {locationSuggestions.map((place) => (
                                      <button
                                        key={place.place_id}
                                        onClick={() => {
                                          handleLocationSelect(place);
                                          setShowLocationDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-4 transition-colors group">
                                        <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange-50 transition-colors">
                                          <MapPin size={16} className="text-gray-400 group-hover:text-[#ff9500]" />
                                        </div>
                                        <div className="overflow-hidden">
                                          <div className="font-semibold text-gray-800 text-sm mb-0.5 truncate">{place.display_name.split(",")[0]}</div>
                                          <div className="text-[11px] text-gray-400 truncate">{place.display_name}</div>
                                        </div>
                                      </button>
                                    ))}
                                  </>
                                ) : (
                                  recentLocations.length > 0 && (
                                    <>
                                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-2 flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-gray-100"></span>
                                        Recent Locations
                                      </div>
                                      {recentLocations.map((place, index) => (
                                        <button
                                          key={index}
                                          onClick={() => {
                                            handleLocationSelect(place);
                                            setShowLocationDropdown(false);
                                          }}
                                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-4 transition-colors group">
                                          <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange-50 transition-colors">
                                            <History size={16} className="text-gray-400 group-hover:text-[#ff9500]" />
                                          </div>
                                          <div className="overflow-hidden">
                                            <div className="font-semibold text-gray-800 text-sm mb-0.5 truncate">{place.display_name.split(",")[0]}</div>
                                            <div className="text-[11px] text-gray-400 truncate">{place.display_name}</div>
                                          </div>
                                        </button>
                                      ))}
                                    </>
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          {/* Search Input */}
                          <div className="flex-1 flex items-center px-4 py-2 md:py-4 relative z-0">
                            <Search className="md:hidden text-[#ff5e00] mr-2" size={18} />
                            <input
                              type="text"
                              placeholder="Search for restaurant, cuisine.."
                              className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base py-1"
                              {...register("query")}
                            />
                            <div className="flex items-center gap-2">
                              {watch("query") && (
                                <button type="button" onClick={() => setValue("query", "")} className="p-1.5 text-gray-400 hover:text-gray-600">
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          </div>

                          <button type="submit" className="hidden md:flex px-6 py-3 md:py-4 items-center justify-center text-gray-400 hover:text-[#ff9500]">
                            <Search size={22} className="stroke-[2.5px]" />
                          </button>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        {filters.map((filter) => {
                          let count = 0;
                          if (filter === "Filters") {
                            if (appliedFilters.sort && appliedFilters.sort !== "rating_high_low") count++;
                            if (appliedFilters.rating && appliedFilters.rating !== "Any") count++;
                            if (appliedFilters.cost && appliedFilters.cost.length > 0) count += appliedFilters.cost.length;
                          }
                          return (
                            <button
                              key={filter}
                              onClick={() => filter === "Filters" ? setIsFilterModalOpen(true) : setActiveFilter((prev) => prev === filter ? null : filter)}
                              className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${activeFilter === filter ? "bg-[#ffe8d6] text-[#ff5e00] border-[#ff5e00] shadow-sm" : "bg-white text-gray-600 border-gray-100 hover:bg-gray-200"
                                }`}>
                              {filter === "Filters" && <Filter size={14} className="inline mr-0.5" />}
                              {filter}
                              {filter === "Filters" && count > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 ml-1 text-[10px] font-bold text-white bg-[#ff5e00] rounded-full">{count}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                      {selectedCoordinates ? "Restaurants Near You" : "All Restaurants"}
                    </h3>
                  </main>
                </div>
              );
            }

            if (isLoader) {
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
                  className="flex justify-center items-center py-4">
                  <Loader size="small" showText={true} text="Loading more" />
                </div>
              );
            }

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
                }}
                className="py-1 md:py-2">
                <main className="max-w-7xl mx-auto px-4 md:px-8">
                  <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                    {rowItems === "SKELETON"
                      ? Array.from({ length: columns }).map((_, i) => <SkeletonCard key={i} />)
                      : rowItems.map((restaurant) => restaurant && <RestaurantCard key={restaurant._id} item={restaurant} />)}
                  </div>
                </main>
              </div>
            );
          })}
        </div>
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        filters={appliedFilters} 
        onApply={setAppliedFilters}
        hasLocation={!!selectedCoordinates}
      />

      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLocationModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsLocationModalOpen(false);
              }}
              dragControls={dragControls}
              dragListener={false}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 pb-12 shadow-2xl overflow-hidden h-[80vh] flex flex-col">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0 cursor-grab active:cursor-grabbing" onPointerDown={(e) => dragControls.start(e)} />

              <div className="flex items-center justify-between mb-6 shrink-0" onPointerDown={(e) => dragControls.start(e)}>
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Your Location</h2>
                <button onClick={() => setIsLocationModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 active:bg-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-6 shrink-0">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ff9500]">
                  <Search size={22} />
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search for area, street name.."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-50 focus:border-[#ff9500]/20 focus:bg-white px-12 py-4 rounded-2xl outline-none text-gray-900 font-medium placeholder-gray-400 transition-all text-[15px]"
                />
                {locationQuery && (
                  <button onClick={() => setLocationQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-200 p-1 rounded-full text-gray-500 hover:text-gray-700">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
                <button
                  onClick={handleDetectLocation}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors text-left group mb-2 border border-gray-50 bg-white shadow-sm active:scale-[0.98]">
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
                    <LocateFixed size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 text-[15px]">Detect current location</div>
                    <div className="text-xs text-gray-400">Using GPS for more accurate results</div>
                  </div>
                </button>

                <div className="space-y-1 mt-4">
                  {locationSuggestions.length > 0 ? (
                    <>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-gray-100"></span>
                        Suggestions
                      </div>
                      {locationSuggestions.map((place) => (
                        <button
                          key={place.place_id}
                          onClick={() => handleLocationSelect(place)}
                          className="w-full flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left group">
                          <div className="text-gray-400 group-hover:text-[#ff9500] transition-colors shrink-0">
                            <MapPin size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-semibold text-gray-800 mb-0.5 truncate">{place.display_name.split(",")[0]}</div>
                            <div className="text-sm text-gray-400 line-clamp-1">{place.display_name}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : recentLocations.length > 0 ? (
                    <>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-gray-100"></span>
                        Recent Locations
                      </div>
                      {recentLocations.map((place, index) => (
                        <button
                          key={index}
                          onClick={() => handleLocationSelect(place)}
                          className="w-full flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left group">
                          <div className="text-gray-400 group-hover:text-[#ff9500] transition-colors shrink-0">
                            <History size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-semibold text-gray-800 mb-0.5 truncate">{place.display_name.split(",")[0]}</div>
                            <div className="text-sm text-gray-400 line-clamp-1">{place.display_name}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin size={32} className="text-gray-200" />
                      </div>
                      <p className="text-gray-400 text-sm">Search for your city or area to see restaurants nearby</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
