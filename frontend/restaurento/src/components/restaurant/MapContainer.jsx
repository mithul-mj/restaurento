import { AdvancedMarker, APIProvider, Map, Pin } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import { X } from 'lucide-react';
import { usePlaceAutocomplete } from '../../hooks/usePlaceAutocomplete';
import { useGeocoding } from '../../hooks/useGeocoding';

const libraries = ['places', 'geocoding'];

const SearchBar = ({ onPlaceSelect }) => {
    const { inputRef } = usePlaceAutocomplete(onPlaceSelect);
    const [inputValue, setInputValue] = useState("");

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
            setInputValue("");
            inputRef.current.focus();
        }
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[450px] max-w-[90%] z-10 flex items-center">
            <input
                ref={inputRef}
                className="w-full h-11 pl-4 pr-10 rounded-full border border-gray-300 shadow-md text-sm outline-none bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Search for a location..."
                onChange={(e) => setInputValue(e.target.value)}
            />
            {inputValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

const MapInner = ({ onLocationSelect }) => {
    const [markerPosition, setMarkerPosition] = useState(null);
    const { reverseGeocode, extractDistrict } = useGeocoding();

    const handleMapClick = (event) => {
        if (event.detail.latLng) {
            const { lat, lng } = event.detail.latLng;
            setMarkerPosition({ lat, lng });
            reverseGeocode(lat, lng, onLocationSelect);
        }
    };

    const handlePlaceSelect = (place) => {
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });

        const address = place.formatted_address || place.name || "";
        const district = extractDistrict(place.address_components);

        onLocationSelect({ lat, lng, address, district });
    };

    return (
        <>
            <SearchBar onPlaceSelect={handlePlaceSelect} />
            <Map
                defaultCenter={{ lat: 28.6139, lng: 77.209 }}
                defaultZoom={10}
                gestureHandling="greedy"
                disableDefaultUI={true}
                onClick={handleMapClick}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            >
                {markerPosition && (
                    <AdvancedMarker position={markerPosition} >
                        <Pin background={'#ff0000ff'} glyphColor={'#000'} borderColor={'#000'} />
                    </AdvancedMarker>
                )}
            </Map>
        </>
    );
}

const MapContainer = ({ onLocationSelect }) => {
    return (
        <div className="w-full h-[500px] relative rounded-xl overflow-hidden shadow-inner border border-gray-200">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
                <MapInner onLocationSelect={onLocationSelect} />
            </APIProvider>
        </div >
    );
};

export default MapContainer;