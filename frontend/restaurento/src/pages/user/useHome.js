
import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import userService from "../../services/user.service";
import useDebounce from "../../hooks/useDebounce";
import { showError } from "../../utils/alert";

const useHome = () => {
    const { register, watch, setValue } = useForm();
    const queryValue = watch("query", "");
    const debouncedSearchQuery = useDebounce(queryValue, 500);

    const [activeFilter, setActiveFilter] = useState(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({
        sort: "rating_high_low",
        rating: "Any",
        cost: [],
    });
    const filters = ["Filters", "Open Now"];

    const [placeholderText, setPlaceholderText] = useState("Search or Detect location..");
    const [recentLocations, setRecentLocations] = useState([]);
    const [locationQuery, setLocationQuery] = useState("");
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const locationWrapperRef = useRef(null);
    const debouncedLocationQuery = useDebounce(locationQuery, 400);

    const { data: bannersData, isLoading: isLoadingBanners } = useQuery({
        queryKey: ["active-banners"],
        queryFn: () => userService.getActiveBanners(),
    })

    const activeBanners = bannersData?.data || [];


    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Detected:", latitude, longitude);
                setSelectedCoordinates({ lat: latitude, lon: longitude });
                setAppliedFilters(prev => ({ ...prev, sort: "distance" }));

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    setPlaceholderText(data.display_name);
                } catch (error) {
                    setPlaceholderText("Current Location");
                }
                setLocationQuery("");
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
        const saved = localStorage.getItem("recentLocations");
        if (saved) {
            setRecentLocations(JSON.parse(saved));
        }

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

            }
        };

        fetchLocations();
    }, [debouncedLocationQuery]);


    const handleLocationSelect = (place) => {
        setPlaceholderText(place.display_name)
        setLocationQuery('');
        setShowLocationDropdown(false);
        setSelectedCoordinates({ lat: place.lat, lon: place.lon });

        setAppliedFilters(prev => ({ ...prev, sort: "distance" }));

        const newRecent = [
            place,
            ...recentLocations.filter((p) => p.display_name !== place.display_name)
        ].slice(0, 5);
        setRecentLocations(newRecent);
        localStorage.setItem('recentLocations', JSON.stringify(newRecent));

        console.log("Selected Location:", { lat: place.lat, lon: place.lon });
    };

    const [columns, setColumns] = useState(3);
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

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: ["restaurants", debouncedSearchQuery, appliedFilters, selectedCoordinates, activeFilter],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            const limit = columns * 4;
            const res = await userService.getDashboard(pageParam, limit, debouncedSearchQuery, appliedFilters, selectedCoordinates, activeFilter);
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
        estimateSize: (index) => (index === 0 ? 650 : 440),
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

    return {
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
        placeholderText,
        recentLocations,
        locationQuery,
        setLocationQuery,
        locationSuggestions,
        showLocationDropdown,
        setShowLocationDropdown,
        selectedCoordinates,
        locationWrapperRef,
        handleDetectLocation,
        handleLocationSelect,
        columns,
        parentRef,
        rowVirtualizer,
        virtualRows,
        rows,
        isLoadingInitial,
        allRestaurants,
        activeBanners,
        isLoadingBanners
    };
};

export default useHome;
