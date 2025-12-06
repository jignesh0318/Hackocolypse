import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import safetyAnalysisService from '../services/safetyAnalysis';
import './SafetyHeatmap.css';

interface Zone {
  id: string;
  lat: number;
  lng: number;
  score: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  factors: {
    crimeData: number;
    streetLighting: number;
    crowdDensity: number;
    sosReports: number;
  };
}

interface SafetyHeatmapProps {
  centerLat?: number;
  centerLng?: number;
  radius?: number;
}

const SafetyHeatmap = ({ centerLat = 28.6139, centerLng = 77.209, radius = 2 }: SafetyHeatmapProps) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await safetyAnalysisService.analyzeZones(centerLat, centerLng, radius, 6);
        setZones(data.zones || []);
        setStats({
          safe: data.safeZones?.length || 0,
          unsafe: data.unsafeZones?.length || 0,
          average: data.summary?.averageScore || 0,
        });
      } catch (error) {
        console.error('Failed to load heatmap:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [centerLat, centerLng, radius]);

  const getColor = (score: number): string => {
    if (score >= 70) return '#2ed573'; // Green - Safe
    if (score >= 40) return '#ffa502'; // Yellow - Medium
    return '#ff4757'; // Red - Danger
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

  if (loading) {
    return (
      <div className="safety-heatmap-loading">
        <div className="spinner"></div>
        <p>Analyzing safety zones...</p>
      </div>
    );
  }

  return (
    <div className="safety-heatmap-container">
      <div className="heatmap-stats">
        <div className="stat-card safe">
          <h4>✅ Safe Zones</h4>
          <p className="stat-value">{stats?.safe || 0}</p>
        </div>
        <div className="stat-card unsafe">
          <h4>❌ Unsafe Zones</h4>
          <p className="stat-value">{stats?.unsafe || 0}</p>
        </div>
        <div className="stat-card average">
          <h4>📊 Avg Score</h4>
          <p className="stat-value">{Math.round(stats?.average || 0)}/100</p>
        </div>
      </div>

      <MapContainer
        center={[centerLat, centerLng] as LatLngExpression}
        zoom={13}
        style={{ height: '500px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng] as LatLngExpression}
            radius={400}
            pathOptions={{
              color: getColor(zone.score),
              fillColor: getColor(zone.score),
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div className="zone-popup">
                <h4>{getRiskLabel(zone.riskLevel)}</h4>
                <p><strong>Safety Score:</strong> {zone.score.toFixed(1)}/100</p>
                <div className="factors">
                  <p>🚔 Crime: {zone.factors.crimeData.toFixed(0)}</p>
                  <p>💡 Lighting: {zone.factors.streetLighting.toFixed(0)}</p>
                  <p>👥 Crowd: {zone.factors.crowdDensity.toFixed(0)}</p>
                  <p>🚨 SOS: {zone.factors.sosReports.toFixed(0)}</p>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      <div className="zone-list">
        <h3>📍 Zone Details</h3>
        <div className="zones-grid">
          {zones.slice(0, 6).map((zone) => (
            <div key={zone.id} className={`zone-card ${zone.riskLevel.toLowerCase()}`}>
              <div className="zone-header">
                <h4>{getRiskLabel(zone.riskLevel)}</h4>
                <span className="score">{zone.score.toFixed(0)}</span>
              </div>
              <div className="zone-factors">
                <div className="factor">
                  <span className="label">Crime</span>
                  <div className="bar">
                    <div className="fill" style={{ width: `${zone.factors.crimeData}%` }}></div>
                  </div>
                </div>
                <div className="factor">
                  <span className="label">Lighting</span>
                  <div className="bar">
                    <div className="fill" style={{ width: `${zone.factors.streetLighting}%` }}></div>
                  </div>
                </div>
                <div className="factor">
                  <span className="label">Crowd</span>
                  <div className="bar">
                    <div className="fill" style={{ width: `${zone.factors.crowdDensity}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyHeatmap;
