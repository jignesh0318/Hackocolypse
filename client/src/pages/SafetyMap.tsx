import { useState } from 'react';
import Header from '../components/Header';
import Map from '../components/Map';
import './SafetyMap.css';

interface SafetyMapProps {
  onLogout: () => void;
}

const SafetyMap = ({ onLogout }: SafetyMapProps) => {
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="safety-map-page">
      <Header onLogout={onLogout} />
      
      <div className="safety-map-container">
        <div className="map-header">
          <h1>Live Safety Map</h1>
          <p>Real-time zone safety ratings and community reports</p>
        </div>

        <div className="map-controls">
          <button
            className={`control-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Zones
          </button>
          <button
            className={`control-btn ${filterType === 'safe' ? 'active' : ''}`}
            onClick={() => setFilterType('safe')}
          >
            ✅ Safe
          </button>
          <button
            className={`control-btn ${filterType === 'alert' ? 'active' : ''}`}
            onClick={() => setFilterType('alert')}
          >
            ⚠️ Alert
          </button>
          <button
            className={`control-btn ${filterType === 'danger' ? 'active' : ''}`}
            onClick={() => setFilterType('danger')}
          >
            🚨 Danger
          </button>
        </div>

        <div className="map-wrapper">
          <Map />
        </div>

        <div className="map-info">
          <p>🔍 Tap on zones to view details and community feedback</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyMap;
