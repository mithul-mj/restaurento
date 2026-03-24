import { AdvancedMarker, APIProvider, Map, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const libraries = ['places', 'geocoding'];

// Internal component handling the map interactions
const MapContent = ({ onLocationSelect }) => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const geocodingLib = useMapsLibrary('geocoding');

    const [markerPosition, setMarkerPosition] = useState(null);
    // We use a separate state for the clear button visibility to avoid fighting with Google's autocomplete input
    const [hasSearchText, setHasSearchText] = useState(false);

    const inputRef = useRef(null);
    const geocoderRef = useRef(null);

    // Initialize Geocoder
    useEffect(() => {
        if (geocodingLib) {
            geocoderRef.current = new geocodingLib.Geocoder();
        }
    }, [geocodingLib]);

    // Helper: Extract district from address components
    const extractDistrict = (components) => {
        if (!components) return "";
        const districtComponent = components.find(component =>
            component.types.includes('administrative_area_level_2')
        );
        return districtComponent ? districtComponent.long_name : "";
    };

    // Initialize Autocomplete
    useEffect(() => {
        if (!placesLib || !inputRef.current) return;

        const autocomplete = new placesLib.Autocomplete(inputRef.current, {
            fields: ['geometry', 'name', 'formatted_address', 'address_components'],
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            // Check if place has geometry (it should if selected from dropdown)
            if (!place.geometry || !place.geometry.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || place.name || "";
            const district = extractDistrict(place.address_components);

            // Update Map View
            if (place.geometry.viewport) {
                map?.fitBounds(place.geometry.viewport);
            } else {
                map?.setCenter({ lat, lng });
                map?.setZoom(15);
            }

            // Update Marker and State
            setMarkerPosition({ lat, lng });
            setHasSearchText(true);

            // Notify Parent
            onLocationSelect({ lat, lng, address, district });
        });
    }, [placesLib, map, onLocationSelect]);

    // Handle Map Clicks (Reverse Geocoding)
    const handleMapClick = useCallback((event) => {
        if (!event.detail.latLng || !geocoderRef.current) return;

        const { lat, lng } = event.detail.latLng;
        setMarkerPosition({ lat, lng });

        geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                const district = extractDistrict(results[0].address_components);

                // Update input field text
                if (inputRef.current) {
                    inputRef.current.value = address;
                    setHasSearchText(true);
                }

                // Notify Parent
                onLocationSelect({ lat, lng, address, district });
            } else {
                console.error("Geocoding failed: " + status);
            }
        });
    }, [onLocationSelect]);

    // Clear Search Input
    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.focus();
            setHasSearchText(false);
        }
    };

    return (
        <>
            {/* Search Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[450px] max-w-[90%] z-10 flex items-center">
                <input
                    ref={inputRef}
                    className="w-full h-11 pl-4 pr-10 rounded-full border border-gray-300 shadow-md text-sm outline-none bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Search for a location..."
                    onChange={(e) => setHasSearchText(e.target.value.length > 0)}
                />
                {hasSearchText && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                        type="button"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Map */}
            <Map
                defaultCenter={{ lat: 28.6139, lng: 77.209 }}
                defaultZoom={10}
                gestureHandling="greedy"
                disableDefaultUI={true}
                onClick={handleMapClick}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            >
                {markerPosition && (
                    <AdvancedMarker position={markerPosition}>
                        <Pin background={'#ff5e00'} glyphColor={'#fff'} borderColor={'#cc4b00'} />
                    </AdvancedMarker>
                )}
            </Map>
        </>
    );
};

// Main Container
const MapContainer = ({ onLocationSelect }) => {
    return (
        <div className="w-full h-[500px] relative rounded-xl overflow-hidden shadow-inner border border-gray-200">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
                <MapContent onLocationSelect={onLocationSelect} />
            </APIProvider>
        </div>
    );
};

export default MapContainer;
