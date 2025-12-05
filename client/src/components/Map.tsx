import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import L from 'leaflet';

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

interface SafetyZone {
  id: number;
  lat: number;
  lng: number;
  score: number;
  name: string;
}

const Map = () => {
  // Mock safety zones data
  const safetyZones: SafetyZone[] = [
    { id: 1, lat: 28.6139, lng: 77.2090, score: 85, name: 'Connaught Place' },
    { id: 2, lat: 28.6280, lng: 77.2177, score: 45, name: 'Kashmere Gate' },
    { id: 3, lat: 28.6517, lng: 77.2219, score: 92, name: 'Mall Road' },
    { id: 4, lat: 28.5355, lng: 77.3910, score: 35, name: 'Noida Sector 18' },
    { id: 5, lat: 28.7041, lng: 77.1025, score: 70, name: 'Rohini' },
  ];

  const getColor = (score: number) => {
    if (score >= 70) return '#2ed573'; // Green - Safe
    if (score >= 40) return '#ffa502'; // Yellow - Medium
    return '#ff4757'; // Red - Danger
  };

  const getLabel = (score: number) => {
    if (score >= 70) return 'SAFE';
    if (score >= 40) return 'MEDIUM RISK';
    return 'HIGH RISK';
  };

  return (
    <MapContainer
      center={[28.6139, 77.2090]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {safetyZones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.lat, zone.lng]}
          radius={800}
          pathOptions={{
            color: getColor(zone.score),
            fillColor: getColor(zone.score),
            fillOpacity: 0.3,
          }}
        >
          <Popup>
            <div className="popup-content">
              <h3>{zone.name}</h3>
              <div className={`safety-score ${getLabel(zone.score).toLowerCase().replace(' ', '-')}`}>
                <strong>{zone.score}/100</strong>
              </div>
              <div
                className={`safety-label ${getLabel(zone.score).toLowerCase().replace(' ', '-')}-bg`}
              >
                {getLabel(zone.score)}
              </div>
              <div className="factors">
                <p>🔦 Lighting: {zone.score > 70 ? 'Good' : zone.score > 40 ? 'Medium' : 'Poor'}</p>
                <p>👥 Crowd: {zone.score > 70 ? 'High' : zone.score > 40 ? 'Medium' : 'Low'}</p>
                <p>📹 CCTV: {zone.score > 70 ? 'Present' : 'Limited'}</p>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default Map;