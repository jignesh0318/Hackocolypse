import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Circle } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import L from 'leaflet';
import routeTracker from '../services/routeTracker';

// Fix marker icon issue (guarded so it doesn't throw in edge cases)
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
} catch (e) {
  console.warn('Leaflet icon override skipped:', e);
}

type RoutePoint = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
};

const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090];

const Map = () => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);

  // Pull live route data from tracker
  useEffect(() => {
    const updateRoute = () => {
      const data = routeTracker.getRouteData();
      const pts: RoutePoint[] = data.points.map((p) => ({
        lat: p.latitude,
        lng: p.longitude,
        accuracy: p.accuracy,
        timestamp: p.timestamp,
      }));
      setRoutePoints(pts);
      if (pts.length) {
        const last = pts[pts.length - 1];
        setCenter([last.lat, last.lng]);
      }
    };

    updateRoute();
    const interval = setInterval(updateRoute, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get a starting position for centering if no route points yet
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCenter: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(nextCenter);
        if (!routePoints.length) {
          setRoutePoints([{ lat: nextCenter[0], lng: nextCenter[1], accuracy: pos.coords.accuracy, timestamp: Date.now() }]);
        }
      },
      () => {
        // Ignore errors; keep default center
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  }, []);

  const path: LatLngExpression[] = useMemo(
    () => routePoints.map((p) => [p.lat, p.lng]),
    [routePoints]
  );

  const start = routePoints[0];
  const current = routePoints[routePoints.length - 1];

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Tracked route polyline */}
      {path.length > 1 && (
        <Polyline positions={path} color="#5f27cd" weight={5} opacity={0.8} />
      )}

      {/* Start marker */}
      {start && (
        <Marker position={[start.lat, start.lng] as [number, number]} />
      )}

      {/* Current marker with optional accuracy circle */}
      {current && (
        <>
          <Marker position={[current.lat, current.lng] as [number, number]} />
          {current.accuracy && (
            <Circle
              center={[current.lat, current.lng] as [number, number]}
              radius={current.accuracy}
              pathOptions={{ color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 0.1 }}
            />
          )}
        </>
      )}
    </MapContainer>
  );
};

export default Map;