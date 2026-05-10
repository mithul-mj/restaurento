import React from "react";
import {
  Search,
  Filter,
  MapPin,
  ChevronDown,
  X,
  LocateFixed,
  History,
  Bell,
} from "lucide-react";
import FilterModal from "./FilterModal";
import Loader from "../../components/Loader";
import RestaurantCard from "../../components/user/RestaurantCard";
import SkeletonCard from "../../components/user/SkeletonCard";
import BannerCarousel from "../../components/user/BannerCarousel";
import useHome from "./useHome";
import { useLocation } from "../../context/LocationContext";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import notificationService from "../../services/notification.service";
import NotificationModal from "../../pages/user/NotificationModal";

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

  React.useEffect(() => {
    document.title = "Discover Top Restaurants | Restaurento";
  }, []);

  const { user } = useSelector((state) => state.auth);
  const avatar = user?.avatar;
  const [isNotifModalOpen, setIsNotifModalOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const socket = useSocket();

  React.useEffect(() => {
    if (user?._id) {
      notificationService.getUnreadCount().then(res => {
        if (res.success) setUnreadCount(res.count);
      });
    }
  }, [user?._id]);

  React.useEffect(() => {
    if (socket && user?._id) {
      socket.emit("join_private_room", user._id);
      socket.on("new_notification", (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
      return () => {
        socket.off("new_notification");
      };
    }
  }, [socket, user?._id]);

  const handleBellClick = async () => {
    if (!isNotifModalOpen) {
      const res = await notificationService.getNotifications(1);
      if (res.success) {
        setNotifications(res.notifications);
        setHasNextPage(res.meta.hasNextPage);
        setCurrentPage(1);
      }
    }
    setIsNotifModalOpen(!isNotifModalOpen);
  };

  const handleLoadMoreNotifs = async () => {
    const nextPage = currentPage + 1;
    const res = await notificationService.getNotifications(nextPage);
    if (res.success) {
      setNotifications(prev => [...prev, ...res.notifications]);
      setHasNextPage(res.meta.hasNextPage);
      setCurrentPage(nextPage);
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await notificationService.markAllAsRead();
    if (res.success) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleMarkAsRead = async (id) => {
    const res = await notificationService.markOneAsRead(id);
    if (res.success) {
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] overflow-hidden">
      {/* Mobile Location Header moved to UserNavbar */}

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
                    {/* Mobile Header (Location & Notifications) */}
                    <div className="md:hidden flex items-center justify-between mb-8 mt-4">
                        <div 
                            onClick={() => setIsLocationModalOpen(true)}
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <div className="relative flex items-center justify-center">
                                <MapPin size={28} strokeWidth={1.5} className="text-[#111]" />
                                <div className="absolute -bottom-0.5 -right-0.5 bg-[#fcfcfc] rounded-full p-[1.5px]">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                </div>
                            </div>
                            <div className="bg-[#1c1c1c] text-white px-3.5 py-1.5 rounded-full text-[12px] font-medium tracking-wide max-w-[140px] truncate">
                                {placeholderText}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    <button
                                        onClick={handleBellClick}
                                        className="relative text-[#111] p-3 bg-[#f5f5f5] hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <Bell size={22} strokeWidth={1.5} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#f5f5f5]"></span>
                                        )}
                                    </button>
                                    <Link to="/profile">
                                        <div className="w-11 h-11 bg-[#e9e0ff] rounded-full overflow-hidden border border-gray-100">
                                            <img
                                                src={
                                                    avatar ||
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=ff5e00&color=fff`
                                                }
                                                alt="Profile"
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-[#1c1c1c] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-lg uppercase tracking-wider transition-all active:scale-[0.98]">
                                    Join Now
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Discover Text */}
                    <div className="md:hidden mb-8">
                      <h1 className="text-[34px] leading-[1.1] font-bold text-[#111111] tracking-tight">
                        Discover<br />Top Restaurants
                      </h1>
                    </div>

                    {/* Desktop Banner Carousel */}
                    <div className="hidden md:block -mx-4 md:mx-0 mt-4 md:mt-0">
                      <BannerCarousel
                        banners={activeBanners}
                        isLoading={isLoadingBanners}
                      />
                    </div>
 
                    <div className="relative z-30 bg-transparent -mx-4 px-4 pt-2 md:pt-0 transition-all duration-300">
                      <div className="w-full max-w-4xl mx-auto md:mt-2 md:-mt-14 relative z-10 mb-4 md:px-2">
                        <div
                          className="relative flex flex-col md:flex-row md:shadow-xl md:shadow-gray-200/50 rounded-full md:rounded-xl bg-transparent md:bg-white max-w-4xl mx-auto border-none md:border md:border-gray-100"
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
                          <div className="flex-1 flex items-center px-6 py-4 md:py-4 relative z-0 bg-[#f5f5f5] md:bg-transparent rounded-full md:rounded-none">
                            <Search className="md:hidden text-[#111] mr-3" size={22} strokeWidth={1.5} />
                            
                            <div className="w-full relative flex items-center">
                              <input
                                type="text"
                                placeholder="Search for restaurant, cuisine.."
                                className="w-full bg-transparent focus:outline-none text-[#111] placeholder-gray-400 text-[16px] md:text-base py-1 relative z-10"
                                {...register("query")}
                              />
                            </div>

                            <div className="flex items-center gap-2 z-10">
                              {watch("query") && (
                                <button type="button" onClick={() => setValue("query", "")} className="p-1.5 text-gray-400 hover:text-gray-600">
                                  <X size={18} />
                                </button>
                              )}
                              {/* Filter Icon for Mobile */}
                              <button 
                                type="button" 
                                onClick={() => setIsFilterModalOpen(true)}
                                className="md:hidden p-1 text-[#111] ml-1"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="3" y1="6" x2="21" y2="6"/>
                                  <line x1="3" y1="12" x2="21" y2="12"/>
                                  <line x1="3" y1="18" x2="21" y2="18"/>
                                  <line x1="15" y1="4" x2="15" y2="8"/>
                                  <line x1="9" y1="10" x2="9" y2="14"/>
                                  <line x1="15" y1="16" x2="15" y2="20"/>
                                </svg>
                              </button>
                            </div>
                          </div>

                          <button type="submit" className="hidden md:flex px-6 py-3 md:py-4 items-center justify-center text-gray-400 hover:text-[#ff9500]">
                            <Search size={22} className="stroke-[2.5px]" />
                          </button>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex items-center gap-2 md:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
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
                              className={`px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border md:border-solid ${filter === 'Filters' ? 'hidden md:flex' : ''} ${activeFilter === filter ? "bg-[#1c1c1c] md:bg-[#ffe8d6] text-white md:text-[#ff5e00] border-transparent md:border-[#ff5e00] shadow-sm" : "bg-[#f5f5f5] md:bg-white text-gray-500 md:text-gray-600 border-transparent md:border-gray-100 hover:bg-gray-200"
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

                      {/* Mobile Categories - Instead of full filters, maybe just categories or nothing. The user mockup didn't show them, but we'll hide the standard filter row on mobile since filter is in search bar now */}
                    </div>

                    {/* Mobile Banner Carousel */}
                    <div className="md:hidden mt-2 mb-6">
                      <BannerCarousel
                        banners={activeBanners}
                        isLoading={isLoadingBanners}
                      />
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

      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMoreNotifs}
      />
    </div>
  );
};

export default Home;
