import React, { useState, useEffect } from 'react';
import offlineRiskDetector from '../services/offlineRiskDetector';
import './RiskZoneAlert.css';

const RiskZoneAlert: React.FC = () => {
  const [currentRisk, setCurrentRisk] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('LOW');
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyRisks, setNearbyRisks] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedZones, setCachedZones] = useState(0);

  useEffect(() => {
    // Update online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Update risk status every 10 seconds
    const updateRiskStatus = () => {
      const pos = offlineRiskDetector.getCurrentPosition();
      if (pos) {
        setPosition(pos);
        const risk = offlineRiskDetector.getPredictiveRisk(pos.lat, pos.lng);
        setCurrentRisk(risk);
        
        const nearby = offlineRiskDetector.findNearbyRiskZones(pos.lat, pos.lng, 1000);
        setNearbyRisks(nearby.length);
      }
      
      const zones = offlineRiskDetector.getRiskZoneCount();
      setCachedZones(zones);
    };

    updateRiskStatus();
    const interval = setInterval(updateRiskStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = () => {
    switch (currentRisk) {
      case 'HIGH': return '#ff4444';
      case 'MEDIUM': return '#ffaa00';
      case 'LOW': return '#44ff44';
      default: return '#888';
    }
  };

  const getRiskEmoji = () => {
    switch (currentRisk) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const getRiskText = () => {
    if (currentRisk === 'HIGH') {
      return 'High Risk Area - Stay Alert!';
    } else if (currentRisk === 'MEDIUM') {
      return 'Medium Risk - Be Cautious';
    }
    return null;
  };

  // Don't show alert if in safe area
  if (currentRisk === 'LOW' && nearbyRisks === 0) {
    return null;
  }

  return (
    <div className={`risk-zone-alert risk-${currentRisk.toLowerCase()}`}>
      <div className="risk-header">
        <span className="risk-emoji">{getRiskEmoji()}</span>
        <div className="risk-info">
          <div className="risk-level">
            {getRiskText()}
          </div>
          <div className="risk-details">
            {nearbyRisks > 0 && (
              <span className="nearby-risks">
                ⚠️ {nearbyRisks} risk zone{nearbyRisks > 1 ? 's' : ''} within 1km
              </span>
            )}
          </div>
        </div>
      </div>

      {isOffline && (
        <div className="offline-risk-notice">
          <span className="offline-icon">📴</span>
          <div className="offline-text">
            <strong>Offline Mode Active</strong>
            <small>Using {cachedZones} cached risk zones for protection</small>
          </div>
        </div>
      )}

      {position && (
        <div className="gps-status">
          📍 GPS Active: {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°
        </div>
      )}
    </div>
  );
};

export default RiskZoneAlert;
