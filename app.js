async function initMap() {
    // Coordinate for the initial center (e.g., New York)
    const position = { lat: 40.7128, lng: -74.0060 };

    // Request the required libraries
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // Initialize the map
    const map = new Map(document.getElementById("map"), {
        zoom: 12,
        center: position,
        mapId: "AIzaSyDlIaBUm74EBURy4Ehxs5pu2HASKVeECZ8", // Required for AdvancedMarkerElement
    });

    // Create a draggable marker
    const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        gmpDraggable: true,
        title: "Drag me!",
    });

    // Add listener to update Lat/Lng on 'dragend'
    marker.addListener("dragend", (event) => {
        const newPos = marker.position;
        document.getElementById("lat").innerText = newPos.lat.toFixed(6);
        document.getElementById("lng").innerText = newPos.lng.toFixed(6);
    });
}