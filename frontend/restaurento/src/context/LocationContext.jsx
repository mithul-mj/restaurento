
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import { showError } from "../utils/alert";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [placeholderText, setPlaceholderText] = useState("Pick a location..");
    const [recentLocations, setRecentLocations] = useState([]);
    const [locationQuery, setLocationQuery] = useState("");
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const debouncedLocationQuery = useDebounce(locationQuery, 400);

    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setSelectedCoordinates({ lat: latitude, lon: longitude });

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    setPlaceholderText(data.display_name);
                } catch (error) {
                    setPlaceholderText("Current Location");
                }
                setLocationQuery("");
                setIsLocationModalOpen(false);
            }, (error) => {
                showError("Geolocation error", "Unable to detect location.");
            });
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem("recentLocations");
        if (saved) setRecentLocations(JSON.parse(saved));
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
        setPlaceholderText(place.display_name);
        setLocationQuery('');
        setIsLocationModalOpen(false);
        setSelectedCoordinates({ lat: place.lat, lon: place.lon });

        const newRecent = [
            place,
            ...recentLocations.filter((p) => p.display_name !== place.display_name)
        ].slice(0, 5);
        setRecentLocations(newRecent);
        localStorage.setItem('recentLocations', JSON.stringify(newRecent));
    };

    return (
        <LocationContext.Provider value={{
            placeholderText,
            recentLocations,
            locationQuery,
            setLocationQuery,
            locationSuggestions,
            isLocationModalOpen,
            setIsLocationModalOpen,
            selectedCoordinates,
            handleDetectLocation,
            handleLocationSelect
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
