import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

const LocationViewer = ({ lat, lng }) => {
    // Basic validation to ensure we have coordinates
    const isValidLocation = lat && lng && !isNaN(lat) && !isNaN(lng);

    if (!isValidLocation) {
        return (
            <div className="w-full h-44 bg-[#E5E7EB] rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                <div
                    className="absolute inset-0 opacity-30 grayscale"
                    style={{
                        backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                    }}></div>
                <div className="flex flex-col items-center gap-2 z-10 text-gray-400">
                    <MapPin size={32} />
                    <span className="text-xs font-medium">Location not available</span>
                </div>
            </div>
        );
    }

    const position = { lat: Number(lat), lng: Number(lng) };

    return (
        <div className="w-full h-56 rounded-xl overflow-hidden shadow-sm border border-gray-200 relative">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={position}
                    defaultZoom={15}
                    mapId={import.meta.env.VITE_GOOGLE_MAPS_ID || "DEMO_MAP_ID"}
                    disableDefaultUI={true}
                    gestureHandling={'cooperative'}
                    className="w-full h-full"
                >
                    <AdvancedMarker position={position}>
                        <Pin background={'#ff5e00'} glyphColor={'#fff'} borderColor={'#cc4b00'} />
                    </AdvancedMarker>
                </Map>
            </APIProvider>
        </div>
    );
};

export default LocationViewer;
