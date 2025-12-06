import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polygon } from 'react-leaflet';
import type { LatLngExpression, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import safetyAnalysisService from '../services/safetyAnalysis';
import './ZoneMap.css';

interface Zone {
  id: string;
  lat: number;
  lng: number;
  score: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  name: string;
  factors: {
    crimeData: number;
    streetLighting: number;
    crowdDensity: number;
    sosReports: number;
  };
}

interface ZoneMapProps {
  centerLat?: number;
  centerLng?: number;
  radius?: number;
  onZoneClick?: (zone: Zone) => void;
}

// Real-world Delhi zones data (can be expanded)
const REAL_WORLD_ZONES: Zone[] = [
  {
    id: 'cp',
    lat: 28.6139,
    lng: 77.209,
    score: 85,
    riskLevel: 'LOW',
    name: 'Connaught Place',
    factors: { crimeData: 10, streetLighting: 95, crowdDensity: 90, sosReports: 5 },
  },
  {
    id: 'kg',
    lat: 28.6280,
    lng: 77.2177,
    score: 35,
    riskLevel: 'HIGH',
    name: 'Kashmere Gate',
    factors: { crimeData: 78, streetLighting: 35, crowdDensity: 45, sosReports: 28 },
  },
  {
    id: 'mr',
    lat: 28.6517,
    lng: 77.2219,
    score: 92,
    riskLevel: 'LOW',
    name: 'Mall Road',
    factors: { crimeData: 5, streetLighting: 98, crowdDensity: 95, sosReports: 2 },
  },
  {
    id: 'ns',
    lat: 28.5355,
    lng: 77.391,
    score: 25,
    riskLevel: 'HIGH',
    name: 'Noida Sector 18',
    factors: { crimeData: 85, streetLighting: 15, crowdDensity: 25, sosReports: 42 },
  },
  {
    id: 'rh',
    lat: 28.7041,
    lng: 77.1025,
    score: 70,
    riskLevel: 'MEDIUM',
    name: 'Rohini',
    factors: { crimeData: 35, streetLighting: 65, crowdDensity: 60, sosReports: 12 },
  },
  {
    id: 'dl',
    lat: 28.6332,
    lng: 77.22,
    score: 55,
    riskLevel: 'MEDIUM',
    name: 'Delhi University',
    factors: { crimeData: 45, streetLighting: 55, crowdDensity: 75, sosReports: 18 },
  },
  {
    id: 'gt',
    lat: 28.6359,
    lng: 77.2266,
    score: 80,
    riskLevel: 'LOW',
    name: 'Greater Kailash',
    factors: { crimeData: 15, streetLighting: 92, crowdDensity: 70, sosReports: 8 },
  },
  {
    id: 'nr',
    lat: 28.5921,
    lng: 77.2580,
    score: 40,
    riskLevel: 'HIGH',
    name: 'Nehru Ridge',
    factors: { crimeData: 72, streetLighting: 40, crowdDensity: 35, sosReports: 32 },
  },
];

const ZoneMap = ({ centerLat = 28.6139, centerLng = 77.209, radius = 3, onZoneClick }: ZoneMapProps) => {
  const [zones, setZones] = useState<Zone[]>(REAL_WORLD_ZONES);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  const getColor = (score: number): string => {
    if (score >= 70) return '#2ed573';
    if (score >= 40) return '#ffa502';
    return '#ff4757';
  };

  const getRiskLabel = (level: string): string => {
    switch (level) {
      case 'LOW':
        return '✅ Safe';
      case 'MEDIUM':
        return '⚠️ Medium Risk';
      case 'HIGH':
        return '❌ Unsafe';
      default:
        return 'Unknown';
    }
  };

  const filteredZones = filterLevel === 'ALL' ? zones : zones.filter((z) => z.riskLevel === filterLevel);

  const safeZones = zones.filter((z) => z.riskLevel === 'LOW');
  const unsafeZones = zones.filter((z) => z.riskLevel === 'HIGH');
  const mediumZones = zones.filter((z) => z.riskLevel === 'MEDIUM');

  return (
    <div className="zone-map-container">
      <div className="map-legend">
        <h3>📍 Zone Legend</h3>
        <div className="legend-items">
          <div className="legend-item safe">
            <div className="legend-color"></div>
            <span>Safe (Score ≥ 70)</span>
            <span className="count">{safeZones.length}</span>
          </div>
          <div className="legend-item medium">
            <div className="legend-color"></div>
            <span>Medium Risk (40-69)</span>
            <span className="count">{mediumZones.length}</span>
          </div>
          <div className="legend-item unsafe">
            <div className="legend-color"></div>
            <span>Unsafe (Score {'<'} 40)</span>
            <span className="count">{unsafeZones.length}</span>
          </div>
        </div>

        <div className="map-filter">
          <label htmlFor="zone-filter-select">Filter Zones:</label>
          <select
            id="zone-filter-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
          >
            <option value="ALL">All Zones</option>
            <option value="LOW">Safe Only</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">Unsafe Only</option>
          </select>
        </div>
      </div>

      <MapContainer
        center={[centerLat, centerLng] as LatLngExpression}
        zoom={12}
        style={{ height: '600px', width: '100%', borderRadius: '12px', marginBottom: '1.5rem' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {filteredZones.map((zone) => (
          <div key={zone.id}>
            {/* Zone Circle */}
            <Circle
              center={[zone.lat, zone.lng] as LatLngExpression}
              radius={500}
              pathOptions={{
                color: getColor(zone.score),
                fillColor: getColor(zone.score),
                fillOpacity: 0.5,
                weight: 3,
              }}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            >
              <Popup>
                <div className="zone-detail-popup">
                  <h4>{zone.name}</h4>
                  <p className="score-badge">{zone.score}/100</p>
                  <p className="risk-label">{getRiskLabel(zone.riskLevel)}</p>
                  <div className="popup-factors">
                    <div className="factor-row">
                      <span>🚔 Crime</span>
                      <div className="factor-bar">
                        <div className={`factor-fill width-${Math.round(zone.factors.crimeData)}`}></div>
                      </div>
                    </div>
                    <div className="factor-row">
                      <span>💡 Lighting</span>
                      <div className="factor-bar">
                        <div className={`factor-fill width-${Math.round(zone.factors.streetLighting)}`}></div>
                      </div>
                    </div>
                    <div className="factor-row">
                      <span>👥 Crowd</span>
                      <div className="factor-bar">
                        <div className={`factor-fill width-${Math.round(zone.factors.crowdDensity)}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>

            {/* Zone Marker */}
            <Marker position={[zone.lat, zone.lng] as LatLngExpression}>
              <Popup>
                <div className="marker-popup">
                  <h4>{zone.name}</h4>
                  <p><strong>Safety Score:</strong> {zone.score}/100</p>
                  <p><strong>Status:</strong> {getRiskLabel(zone.riskLevel)}</p>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      {/* Zone Details Card */}
      <div className="zones-details">
        <h3>📊 Zone Safety Details</h3>
        <div className="zones-cards-grid">
          {filteredZones.sort((a, b) => b.score - a.score).map((zone) => (
            <div key={zone.id} className={`zone-details-card ${zone.riskLevel.toLowerCase()}`}>
              <div className="card-header">
                <h4>{zone.name}</h4>
                <span className={`risk-badge ${zone.riskLevel.toLowerCase()}`}>{getRiskLabel(zone.riskLevel)}</span>
              </div>

              <div className="score-display">
                <div className={`score-circle ${zone.score >= 70 ? 'score-safe' : zone.score >= 40 ? 'score-medium' : 'score-unsafe'}`}>
                  {zone.score}
                </div>
              </div>

              <div className="factors-breakdown">
                <div className="factor-item">
                  <div className="factor-header">
                    <span>🚔 Crime Rate</span>
                    <span className="percentage">{zone.factors.crimeData}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill danger width-${Math.round(zone.factors.crimeData)}`}></div>
                  </div>
                </div>

                <div className="factor-item">
                  <div className="factor-header">
                    <span>💡 Street Lighting</span>
                    <span className="percentage">{zone.factors.streetLighting}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill safe width-${Math.round(zone.factors.streetLighting)}`}
                    ></div>
                  </div>
                </div>

                <div className="factor-item">
                  <div className="factor-header">
                    <span>👥 Crowd Density</span>
                    <span className="percentage">{zone.factors.crowdDensity}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill info width-${Math.round(zone.factors.crowdDensity)}`}></div>
                  </div>
                </div>

                <div className="factor-item">
                  <div className="factor-header">
                    <span>🚨 SOS Reports</span>
                    <span className="percentage">{zone.factors.sosReports}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill warning width-${Math.round(zone.factors.sosReports)}`}></div>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn-more-info"
                  onClick={() => {
                    setSelectedZone(zone);
                    onZoneClick?.(zone);
                  }}
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Zone Details Modal */}
      {selectedZone && (
        <div className="selected-zone-modal" onClick={() => setSelectedZone(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedZone(null)}>✕</button>

            <div className="modal-body">
              <h2>{selectedZone.name}</h2>
              <p className="zone-coordinates">
                📍 {selectedZone.lat.toFixed(4)}, {selectedZone.lng.toFixed(4)}
              </p>

              <div className="modal-section">
                <h3>Safety Assessment</h3>
                <div className="assessment-grid">
                  <div className="assessment-card">
                    <span className="label">Overall Score</span>
                    <div
                      className={`large-score score-color-${selectedZone.score >= 70 ? 'safe' : selectedZone.score >= 40 ? 'medium' : 'unsafe'}`}
                    >
                      {selectedZone.score}
                    </div>
                    <span className="status">{getRiskLabel(selectedZone.riskLevel)}</span>
                  </div>

                  <div className="assessment-card">
                    <span className="label">Risk Level</span>
                    <div className={`risk-indicator risk-indicator-${selectedZone.score >= 70 ? 'safe' : selectedZone.score >= 40 ? 'medium' : 'unsafe'}`}></div>
                    <span className="status">{selectedZone.riskLevel}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Detailed Factors</h3>
                <div className="detailed-factors">
                  <div className="factor-detail">
                    <h4>🚔 Crime Data</h4>
                    <p className="value">{selectedZone.factors.crimeData}%</p>
                    <p className="description">
                      {selectedZone.factors.crimeData > 60
                        ? 'High crime incidents reported'
                        : selectedZone.factors.crimeData > 30
                          ? 'Moderate crime activity'
                          : 'Low crime area'}
                    </p>
                  </div>

                  <div className="factor-detail">
                    <h4>💡 Street Lighting</h4>
                    <p className="value">{selectedZone.factors.streetLighting}%</p>
                    <p className="description">
                      {selectedZone.factors.streetLighting > 70
                        ? 'Well-lit area for safe travel'
                        : selectedZone.factors.streetLighting > 40
                          ? 'Partial lighting available'
                          : 'Poor lighting - travel with caution'}
                    </p>
                  </div>

                  <div className="factor-detail">
                    <h4>👥 Crowd Density</h4>
                    <p className="value">{selectedZone.factors.crowdDensity}%</p>
                    <p className="description">
                      {selectedZone.factors.crowdDensity > 70
                        ? 'High population density - safer area'
                        : selectedZone.factors.crowdDensity > 40
                          ? 'Moderate crowd presence'
                          : 'Isolated area - higher risk'}
                    </p>
                  </div>

                  <div className="factor-detail">
                    <h4>🚨 SOS Reports</h4>
                    <p className="value">{selectedZone.factors.sosReports}%</p>
                    <p className="description">
                      {selectedZone.factors.sosReports > 20
                        ? 'Multiple safety incidents reported'
                        : selectedZone.factors.sosReports > 10
                          ? 'Few incidents in this area'
                          : 'Minimal safety concerns'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-section recommendations">
                <h3>🎯 Recommendations</h3>
                <ul>
                  {selectedZone.riskLevel === 'LOW' && (
                    <>
                      <li>✅ This is a relatively safe area</li>
                      <li>✅ Good street lighting and crowd presence</li>
                      <li>✅ Suitable for solo travel</li>
                    </>
                  )}
                  {selectedZone.riskLevel === 'MEDIUM' && (
                    <>
                      <li>⚠️ Exercise caution in this area</li>
                      <li>⚠️ Avoid traveling alone late at night</li>
                      <li>⚠️ Stay alert and aware of surroundings</li>
                    </>
                  )}
                  {selectedZone.riskLevel === 'HIGH' && (
                    <>
                      <li>❌ Avoid if possible, especially at night</li>
                      <li>❌ Always travel with others</li>
                      <li>❌ Share your location with trusted contacts</li>
                      <li>❌ Use alternative safer routes</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneMap;
