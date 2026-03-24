import { useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Polyline, Marker } from '@react-google-maps/api';
import { Map as MapIcon } from 'lucide-react';

const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const MapDisplay = ({ mapResult, isLoaded }) => {
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Auto-fit bounds when route changes
  useEffect(() => {
    if (mapRef.current && mapResult && mapResult.routePath && mapResult.routePath.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mapResult.routePath.forEach(point => bounds.extend(point));
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [mapResult]);

  if (!isLoaded) return <div className="w-full h-full bg-[#0B1221] flex items-center justify-center text-white">Loading Map...</div>;

  return (
    <div className="w-full h-full relative bg-[#0B1221] overflow-hidden rounded-xl">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={defaultCenter}
        zoom={5}
        onLoad={onMapLoad}
        options={{
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
            { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
          ],
          disableDefaultUI: false,
          backgroundColor: '#0B1221',
        }}
      >
        {/* Draw the route polyline */}
        {mapResult && mapResult.routePath && (
          <Polyline
            path={mapResult.routePath}
            options={{
              strokeColor: '#D4AF37',
              strokeWeight: 5,
              strokeOpacity: 0.9,
            }}
          />
        )}

        {/* Origin marker */}
        {mapResult && mapResult.origin && (
          <Marker
            position={mapResult.origin}
            label={{ text: 'A', color: '#0B1221', fontWeight: 'bold' }}
          />
        )}

        {/* Destination marker */}
        {mapResult && mapResult.destination && (
          <Marker
            position={mapResult.destination}
            label={{ text: 'B', color: '#0B1221', fontWeight: 'bold' }}
          />
        )}

        {/* Waypoint markers */}
        {mapResult && mapResult.waypoints && mapResult.waypoints.map((wp, i) => (
          <Marker
            key={i}
            position={wp}
            label={{ text: String(i + 1), color: '#0B1221', fontWeight: 'bold', fontSize: '12px' }}
          />
        ))}
      </GoogleMap>

      {!mapResult && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0B1221]/80 backdrop-blur-md z-[10] pointer-events-none">
          <div className="w-16 h-16 mb-4 text-[#D4AF37]/50 flex items-center justify-center">
            <MapIcon size={48} />
          </div>
          <h2 className="text-base font-medium text-gray-300 mb-2 tracking-wide">Awaiting Route Configurations</h2>
          <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
            Please enter your Source and Destination configurations in Step 1 to auto-trace the exact road trajectories.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
