import { useState, useEffect, useRef } from 'react';
import routeTracker from '../services/routeTracker';
import './GoogleMap.css';

interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  icon?: string;
  color?: string;
}

interface GoogleMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  showGPS?: boolean;
  showRouteTrail?: boolean;
  markers?: MapMarker[];
}

// Use any type for google.maps to avoid TypeScript errors
declare global {
  interface Window {
    google: any;
  }
}

const GoogleMap = ({
  centerLat = 28.6139,
  centerLng = 77.209,
  zoom = 14,
  showGPS = true,
  showRouteTrail = true,
  markers = [],
}: GoogleMapProps) => {
  const mapRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [routePoints, setRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const currentMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Wait for Google Maps to load
    const checkGoogleMaps = () => {
      if (!window.google?.maps) {
        console.warn('⏳ Waiting for Google Maps to load...');
        setTimeout(checkGoogleMaps, 100);
        return;
      }

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapRef.current = map;
      setMapLoaded(true);
      console.log('✅ Google Map initialized successfully');
    };

    checkGoogleMaps();
  }, [centerLat, centerLng, zoom]);

  // Watch current location with GPS
  useEffect(() => {
    if (!showGPS || !mapLoaded) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: gpsAccuracy } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };

        setCurrentLocation(newLocation);
        setAccuracy(gpsAccuracy);
        setRoutePoints((prev) => [...prev, newLocation]);

        if (mapRef.current && currentMarkerRef.current) {
          mapRef.current.setCenter(newLocation);

          // Update current location marker
          currentMarkerRef.current.setPosition(newLocation);

          // Update accuracy circle
          if (accuracyCircleRef.current) {
            accuracyCircleRef.current.setCenter(newLocation);
            accuracyCircleRef.current.setRadius(gpsAccuracy);
          }

          // Update polyline route
          if (showRouteTrail && polylineRef.current) {
            polylineRef.current.setPath(routePoints.map((p) => ({ lat: p.lat, lng: p.lng })));
          }
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [showGPS, mapLoaded, showRouteTrail, routePoints]);

  // Add current location marker and accuracy circle
  useEffect(() => {
    if (!mapLoaded || !currentLocation || !mapRef.current) return;

    if (!currentMarkerRef.current) {
      currentMarkerRef.current = new window.google.maps.Marker({
        map: mapRef.current,
        position: currentLocation,
        title: 'Your Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        animation: window.google.maps.Animation.DROP,
      });

      // Add accuracy circle
      accuracyCircleRef.current = new window.google.maps.Circle({
        map: mapRef.current,
        center: currentLocation,
        radius: accuracy,
        fillColor: '#667eea',
        fillOpacity: 0.1,
        strokeColor: '#667eea',
        strokeOpacity: 0.4,
        strokeWeight: 1,
      });

      // Add polyline for route trail
      if (showRouteTrail) {
        polylineRef.current = new window.google.maps.Polyline({
          map: mapRef.current,
          path: [currentLocation],
          geodesic: true,
          strokeColor: '#667eea',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          icons: [
            {
              icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
              offset: '100%',
            },
          ],
        });
      }
    }
  }, [mapLoaded, currentLocation, accuracy, showRouteTrail]);

  // Add zone markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach((m: any) => m.setMap(null));
    markersRef.current = [];

    // Add provided markers
    markers.forEach((marker) => {
      const googleMarker = new window.google.maps.Marker({
        map: mapRef.current,
        position: { lat: marker.lat, lng: marker.lng },
        title: marker.title,
        icon: marker.icon || 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 10px; max-width: 200px;">
          <h4 style="margin: 0 0 0.5rem 0;">${marker.title}</h4>
          <p style="margin: 0; color: #666;">📍 ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}</p>
        </div>`,
      });

      googleMarker.addListener('click', () => {
        infoWindow.open(mapRef.current, googleMarker);
      });

      markersRef.current.push(googleMarker);
    });
  }, [mapLoaded, markers]);

  return (
    <div className="google-map-container">
      <div ref={mapRef} className="google-map" />

      {/* Loading State */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 10, 15, 0.9)',
          color: '#fff',
          fontSize: '1.2rem',
          zIndex: 1,
        }}>
          <div style={{
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</div>
            <div>Loading Google Maps...</div>
          </div>
        </div>
      )}

      {/* GPS Status Bar */}
      {showGPS && (
        <div className="gps-status">
          <div className="status-content">
            <div className="status-indicator">
              <span className="gps-pulse"></span>
              <span>Live GPS</span>
            </div>
            {currentLocation && (
              <>
                <span className="coord">
                  📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </span>
                <span className="accuracy">
                  ± {Math.round(accuracy)}m
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="map-controls">
        <button
          className="control-btn"
          onClick={() => {
            if (currentLocation && mapRef.current) {
              mapRef.current.setCenter(currentLocation);
              mapRef.current.setZoom(16);
            }
          }}
          title="Center on current location"
        >
          📍
        </button>
        <button
          className="control-btn"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setZoom((mapRef.current.getZoom() || 14) + 1);
            }
          }}
          title="Zoom in"
        >
          ➕
        </button>
        <button
          className="control-btn"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setZoom(Math.max((mapRef.current.getZoom() || 14) - 1, 1));
            }
          }}
          title="Zoom out"
        >
          ➖
        </button>
        <button
          className="control-btn"
          onClick={() => {
            setRoutePoints([]);
            if (polylineRef.current) {
              polylineRef.current.setPath([]);
            }
          }}
          title="Clear route trail"
        >
          🗑️
        </button>
      </div>

      {/* Route Statistics */}
      {showRouteTrail && routePoints.length > 0 && (
        <div className="route-stats">
          <div className="stat-item">
            <span className="label">Route Points</span>
            <span className="value">{routePoints.length}</span>
          </div>
          <div className="stat-item">
            <span className="label">Distance</span>
            <span className="value">{calculateTotalDistance(routePoints).toFixed(2)} km</span>
          </div>
          {currentLocation && (
            <div className="stat-item">
              <span className="label">Accuracy</span>
              <span className="value">{Math.round(accuracy)}m</span>
            </div>
          )}
        </div>
      )}

      {/* Canvas overlay for custom rendering */}
      <canvas ref={canvasRef} className="map-canvas map-canvas-hidden" />
    </div>
  );
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate total distance of route
const calculateTotalDistance = (points: { lat: number; lng: number }[]): number => {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateDistance(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
  }
  return total;
};

export default GoogleMap;
