
import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import userService from "../../services/user.service";
import useDebounce from "../../hooks/useDebounce";
import { showError } from "../../utils/alert";
import { useLocation } from "../../context/LocationContext";

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
    const { selectedCoordinates } = useLocation();

    const locationWrapperRef = useRef(null);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    const { data: bannersData, isLoading: isLoadingBanners } = useQuery({
        queryKey: ["active-banners"],
        queryFn: () => userService.getActiveBanners(),
    })

    const activeBanners = bannersData?.data || [];

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

        const handleClickOutside = (event) => {
            if (locationWrapperRef.current && !locationWrapperRef.current.contains(event.target)) {
                setShowLocationDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
        isLoadingBanners
    };
};

export default useHome;
