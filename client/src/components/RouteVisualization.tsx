import { useEffect, useRef, useState } from 'react';
import './RouteVisualization.css';

interface RouteVisualizationProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  routeData?: {
    waypoints?: Array<{ lat: number; lng: number }>;
    score?: number;
    distance?: number;
    estimatedTime?: number;
    risks?: string[];
    recommendation?: string;
  };
}

const RouteVisualization = ({
  startLat,
  startLng,
  endLat,
  endLng,
  routeData,
}: RouteVisualizationProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const checkGoogleMaps = () => {
      if (!window.google?.maps) {
        console.warn('⏳ Waiting for Google Maps to load...');
        setTimeout(checkGoogleMaps, 100);
        return;
      }

      const startPoint = { lat: startLat, lng: startLng };
      const endPoint = { lat: endLat, lng: endLng };
      const centerLat = (startLat + endLat) / 2;
      const centerLng = (startLng + endLng) / 2;

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: centerLat, lng: centerLng },
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#333333' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#b3d9ff' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Start marker (green)
      new window.google.maps.Marker({
        position: startPoint,
        map: map,
        title: 'Start Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#11b36a',
          fillOpacity: 0.8,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      // End marker (red)
      new window.google.maps.Marker({
        position: endPoint,
        map: map,
        title: 'Destination',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ff5f52',
          fillOpacity: 0.8,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      // Draw route polyline if waypoints are available
      if (routeData?.waypoints && routeData.waypoints.length > 0) {
        const polylinePath = routeData.waypoints.map((wp) => ({
          lat: wp.lat,
          lng: wp.lng,
        }));

        new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: '#667eea',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map: map,
        });

        // Add risk zones as circles if risks exist
        if (routeData.risks && routeData.risks.length > 0 && routeData.waypoints) {
          routeData.risks.forEach((risk, idx) => {
            if (idx < routeData.waypoints!.length) {
              const wp = routeData.waypoints![idx];
              new window.google.maps.Circle({
                center: { lat: wp.lat, lng: wp.lng },
                radius: 200,
                map: map,
                fillColor: '#ff9800',
                fillOpacity: 0.15,
                strokeColor: '#ff9800',
                strokeOpacity: 0.4,
                strokeWeight: 1,
              });
            }
          });
        }
      } else {
        // Draw direct line if no waypoints
        new window.google.maps.Polyline({
          path: [startPoint, endPoint],
          geodesic: true,
          strokeColor: '#667eea',
          strokeOpacity: 0.6,
          strokeWeight: 3,
          map: map,
          icons: [
            {
              icon: { path: 'M 0,-1 0,1' },
              offset: '0',
              repeat: '10px',
            },
          ],
        });
      }

      // Fit bounds to show both markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(startPoint);
      bounds.extend(endPoint);
      map.fitBounds(bounds, 50);

      setMapLoaded(true);
    };

    checkGoogleMaps();
  }, [startLat, startLng, endLat, endLng, routeData]);

  return (
    <div className="route-visualization-container">
      {!mapLoaded && (
        <div className="map-loading-overlay">
          <div className="loading-spinner">
            <div>🗺️</div>
            <div>Loading Map...</div>
          </div>
        </div>
      )}
      <div ref={mapRef} className="route-map" />
    </div>
  );
};

export default RouteVisualization;
