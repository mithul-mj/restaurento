import { useState, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export const useGeocoding = () => {
    const geocodingLib = useMapsLibrary('geocoding');
    const [geocoder, setGeocoder] = useState(null);

    useEffect(() => {
        if (geocodingLib) {
            setGeocoder(new geocodingLib.Geocoder());
        }
    }, [geocodingLib]);

    const extractDistrict = (components) => {
        if (!components) return "";
        const districtComponent = components.find(component =>
            component.types.includes('administrative_area_level_2')
        );
        return districtComponent ? districtComponent.long_name : "";
    };

    const reverseGeocode = (lat, lng, callback) => {
        if (!geocoder) {
            console.warn("Geocoder not ready");
            callback({ lat, lng, address: "Loading address...", district: "" });
            return;
        }

        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                const district = extractDistrict(results[0].address_components);
                callback({ lat, lng, address, district });
            } else {
                console.error("Geocoder failed due to: " + status);
                callback({ lat, lng, address: "Address not found", district: "" });
            }
        });
    };

    return { reverseGeocode, extractDistrict };
};
