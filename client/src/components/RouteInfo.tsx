import { useState, useEffect } from 'react';
import routeTracker from '../services/routeTracker';
import './RouteInfo.css';

interface RouteInfoProps {
  onClose?: () => void;
}

const RouteInfo = ({ onClose }: RouteInfoProps) => {
  const [routeData, setRouteData] = useState<any>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    const updateInfo = async () => {
      const data = routeTracker.getRouteData();
      setRouteData(data);
      
      const battery = await routeTracker.getBatteryLevel();
      setBatteryLevel(battery);
    };

    updateInfo();
    const interval = setInterval(updateInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleViewRoute = () => {
    if (routeData && routeData.points.length > 0) {
      const firstPoint = routeData.points[0];
      const lastPoint = routeData.points[routeData.points.length - 1];
      
      // Create route URL
      const pointsToShow = routeData.points.length <= 10 
        ? routeData.points 
        : [
            routeData.points[0],
            ...routeData.points.filter((_: any, i: number) => i % Math.floor(routeData.points.length / 8) === 0).slice(0, 8),
            routeData.points[routeData.points.length - 1]
          ];
      
      const origin = `${firstPoint.latitude},${firstPoint.longitude}`;
      const destination = `${lastPoint.latitude},${lastPoint.longitude}`;
      const waypoints = pointsToShow.slice(1, -1).map((p: any) => `${p.latitude},${p.longitude}`).join('|');
      
      const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}`;
      
      window.open(routeUrl, '_blank');
    }
  };

  const handleClearRoute = () => {
    if (confirm('Are you sure you want to clear the route data?')) {
      routeTracker.clearRoute();
      setRouteData(routeTracker.getRouteData());
    }
  };

  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!routeData) {
    return <div className="route-info loading">Loading route data...</div>;
  }

  const duration = routeData.endTime - routeData.startTime;
  const hasRoute = routeData.points.length > 0;

  return (
    <div className="route-info">
      <div className="route-info-header">
        <h3>🗺️ Route Tracking Info</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="route-info-content">
        {/* Battery Status */}
        {batteryLevel !== null && (
          <div className={`info-card battery ${batteryLevel <= 10 ? 'critical' : batteryLevel <= 20 ? 'warning' : 'good'}`}>
            <div className="info-icon">
              {batteryLevel <= 10 ? '🔋' : batteryLevel <= 20 ? '🪫' : '🔋'}
            </div>
            <div className="info-details">
              <h4>Battery Level</h4>
              <p className="info-value">{batteryLevel.toFixed(0)}%</p>
              {batteryLevel <= 10 && (
                <p className="info-warning">⚠️ Critical - Auto-alert enabled</p>
              )}
            </div>
          </div>
        )}

        {/* Route Status */}
        <div className="info-card route">
          <div className="info-icon">📍</div>
          <div className="info-details">
            <h4>Tracking Status</h4>
            <p className="info-value">
              {routeTracker.isActive() ? '✅ Active' : '❌ Inactive'}
            </p>
            <p className="info-subtext">
              {hasRoute ? `${routeData.points.length} locations tracked` : 'No route data yet'}
            </p>
          </div>
        </div>

        {hasRoute && (
          <>
            {/* Distance */}
            <div className="info-card distance">
              <div className="info-icon">🛣️</div>
              <div className="info-details">
                <h4>Distance Traveled</h4>
                <p className="info-value">{routeData.totalDistance.toFixed(2)} km</p>
              </div>
            </div>

            {/* Duration */}
            <div className="info-card duration">
              <div className="info-icon">⏱️</div>
              <div className="info-details">
                <h4>Duration</h4>
                <p className="info-value">{formatDuration(duration)}</p>
                <p className="info-subtext">
                  {formatTime(routeData.startTime)} - {formatTime(routeData.endTime)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="route-actions">
              <button className="btn-view-route" onClick={handleViewRoute}>
                🗺️ View Route on Map
              </button>
              <button className="btn-clear-route" onClick={handleClearRoute}>
                🗑️ Clear Route Data
              </button>
            </div>
          </>
        )}

        {!hasRoute && (
          <div className="no-route-message">
            <p>📍 Route tracking is active. Start moving to see your route!</p>
          </div>
        )}

        {/* Emergency Info */}
        <div className="emergency-info">
          <h4>🔋 Low Battery Protection</h4>
          <p>
            If your battery drops below 5%, your last location and travel route 
            will automatically be sent to your emergency contacts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteInfo;
