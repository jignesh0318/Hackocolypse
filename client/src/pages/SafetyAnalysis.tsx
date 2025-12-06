import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import SafetyHeatmap from '../components/SafetyHeatmap';
import ZoneMap from '../components/ZoneMap';
import RouteVisualization from '../components/RouteVisualization';
import safetyAnalysisService from '../services/safetyAnalysis';
import './SafetyAnalysis.css';

interface SafetyAnalysisPageProps {
  onLogout: () => void;
}

const SafetyAnalysisPage = ({ onLogout }: SafetyAnalysisPageProps) => {
  const [activeTab, setActiveTab] = useState<'zones' | 'heatmap' | 'routes' | 'report'>('zones');
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [reportStatus, setReportStatus] = useState<any>(null);
  const startAutocompleteRef = useRef<any>(null);
  const endAutocompleteRef = useRef<any>(null);

  const [routeForm, setRouteForm] = useState({
    startLocation: '',
    endLocation: '',
  });

  const [reportForm, setReportForm] = useState({
    lat: '',
    lng: '',
    severity: 'MEDIUM',
    description: '',
  });

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!window.google?.maps?.places) {
      console.warn('⏳ Google Places API not loaded yet');
      return;
    }

    const startInput = document.getElementById('start-location') as HTMLInputElement;
    const endInput = document.getElementById('end-location') as HTMLInputElement;

    if (startInput && !startAutocompleteRef.current) {
      startAutocompleteRef.current = new window.google.maps.places.Autocomplete(startInput, {
        fields: ['geometry', 'formatted_address'],
        types: ['geocode'],
      });

      if (startAutocompleteRef.current) {
        startAutocompleteRef.current.addListener('place_changed', () => {
          const place = startAutocompleteRef.current?.getPlace();
          if (place?.geometry?.location) {
            setRouteForm((prev) => ({
              ...prev,
              startLocation: `${place.geometry!.location!.lat()}, ${place.geometry!.location!.lng()}`,
            }));
          }
        });
      }
    }

    if (endInput && !endAutocompleteRef.current) {
      endAutocompleteRef.current = new window.google.maps.places.Autocomplete(endInput, {
        fields: ['geometry', 'formatted_address'],
        types: ['geocode'],
      });

      if (endAutocompleteRef.current) {
        endAutocompleteRef.current.addListener('place_changed', () => {
          const place = endAutocompleteRef.current?.getPlace();
          if (place?.geometry?.location) {
            setRouteForm((prev) => ({
              ...prev,
              endLocation: `${place.geometry!.location!.lat()}, ${place.geometry!.location!.lng()}`,
            }));
          }
        });
      }
    }
  }, []);

  const parseLatLng = (value: string) => {
    const parts = value.split(',').map((p) => p.trim());
    if (parts.length !== 2) return null;
    const [latStr, lngStr] = parts;
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  };

  const resolveLocation = async (value: string) => {
    const parsed = parseLatLng(value);
    if (parsed) return parsed;
    throw new Error('Please enter coordinates (e.g., "28.6139, 77.2090") or select from autocomplete');
  };

  const handleGetRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [start, end] = await Promise.all([
        resolveLocation(routeForm.startLocation),
        resolveLocation(routeForm.endLocation),
      ]);

      const result = await safetyAnalysisService.suggestRoute(start.lat, start.lng, end.lat, end.lng);
      setRouteResult({
        ...result.route,
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
      });
    } catch (error: any) {
      console.error('Route suggestion failed:', error);
      const message = error?.message || 'Failed to suggest route';
      setRouteResult({ error: message });
    } finally {
      setLoading(false);
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await safetyAnalysisService.reportIncident(
        parseFloat(reportForm.lat),
        parseFloat(reportForm.lng),
        reportForm.severity,
        reportForm.description
      );
      setReportStatus(result);
      setReportForm({ lat: '', lng: '', severity: 'MEDIUM', description: '' });
      setTimeout(() => setReportStatus(null), 4000);
    } catch (error) {
      console.error('Report failed:', error);
      setReportStatus({ error: 'Failed to report incident' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="safety-analysis-page">
      <Header onLogout={onLogout} />

      <div className="analysis-container">
        <div className="analysis-header">
          <div>
            <h1>🛡️ Safety Analysis & Smart Routes</h1>
            <p>AI-powered safety zones and route recommendations using crime data, street lighting, and crowd analysis.</p>
          </div>
        </div>

        <div className="analysis-tabs">
          <button
            className={`tab-btn ${activeTab === 'zones' ? 'active' : ''}`}
            onClick={() => setActiveTab('zones')}
          >
            🗺️ Safe & Unsafe Zones
          </button>
          <button
            className={`tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            📊 Heatmap Analysis
          </button>
          <button
            className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            🛤️ Route Planner
          </button>
          <button
            className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            🚨 Report Incident
          </button>
        </div>

        <div className="analysis-content">
          {/* Zones Tab */}
          {activeTab === 'zones' && (
            <div className="tab-content zones-tab">
              <div className="info-box">
                <p>🌍 Interactive map showing real-world safe and unsafe zones:</p>
                <ul>
                  <li>🟢 <strong>Green Zones</strong> - Safe areas with good lighting and low crime</li>
                  <li>🟡 <strong>Yellow Zones</strong> - Medium risk areas requiring caution</li>
                  <li>🔴 <strong>Red Zones</strong> - Unsafe areas to avoid or use with precautions</li>
                </ul>
              </div>
              <ZoneMap centerLat={28.6139} centerLng={77.209} radius={3} />
            </div>
          )}

          {/* Heatmap Tab */}
          {activeTab === 'heatmap' && (
            <div className="tab-content heatmap-tab">
              <div className="info-box">
                <p>📊 This heatmap shows real-time safety analysis based on:</p>
                <ul>
                  <li>🚔 <strong>Crime Data</strong> - Incident reports and severity</li>
                  <li>💡 <strong>Street Lighting</strong> - Coverage and availability</li>
                  <li>👥 <strong>Crowd Density</strong> - Population and activity levels</li>
                  <li>🚨 <strong>SOS Reports</strong> - Community reports and emergencies</li>
                </ul>
              </div>
              <SafetyHeatmap centerLat={28.6139} centerLng={77.209} radius={2} />
            </div>
          )}

          {/* Route Planner Tab */}
          {activeTab === 'routes' && (
            <div className="tab-content routes-tab">
              <div className="route-form-container">
                <form onSubmit={handleGetRoute} className="route-form">
                  <h3>🛤️ Get Safer Route Suggestion</h3>

                  <div className="form-group">
                    <label>Start (address or lat, lng)</label>
                    <input
                      id="start-location"
                      type="text"
                      placeholder="e.g., Connaught Place or 28.6139, 77.2090"
                      value={routeForm.startLocation}
                      onChange={(e) => setRouteForm({ ...routeForm, startLocation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Destination (address or lat, lng)</label>
                    <input
                      id="end-location"
                      type="text"
                      placeholder="e.g., Noida Sector 18 or 28.5355, 77.3910"
                      value={routeForm.endLocation}
                      onChange={(e) => setRouteForm({ ...routeForm, endLocation: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Analyzing...' : '🔍 Suggest Route'}
                  </button>
                </form>

                {routeResult && (
                  <div className={`route-result ${routeResult.error ? 'error' : ''}`}>
                    {routeResult.error ? (
                      <div className="result-content">
                        <p className="error-msg">{routeResult.error}</p>
                        <p className="info-text">
                          💡 Tip: Start typing an address to see autocomplete suggestions, or enter coordinates like "28.6139, 77.2090".
                        </p>
                      </div>
                    ) : (
                      <div className="result-content">
                        {routeResult.startLat && routeResult.startLng && routeResult.endLat && routeResult.endLng && (
                          <>
                            <RouteVisualization
                              startLat={routeResult.startLat}
                              startLng={routeResult.startLng}
                              endLat={routeResult.endLat}
                              endLng={routeResult.endLng}
                              routeData={routeResult}
                            />
                          </>
                        )}
                        <div className="recommendation">{routeResult.recommendation}</div>
                        <div className="route-metrics">
                          <div className="metric">
                            <span className="label">Safety Score</span>
                            <span className="value">{routeResult.score}/100</span>
                          </div>
                          <div className="metric">
                            <span className="label">Distance</span>
                            <span className="value">{routeResult.distance?.toFixed(2) || 'N/A'} km</span>
                          </div>
                          <div className="metric">
                            <span className="label">Est. Time</span>
                            <span className="value">{routeResult.estimatedTime || 'N/A'} min</span>
                          </div>
                        </div>
                        {routeResult.risks && routeResult.risks.length > 0 && (
                          <div className="risks">
                            <h4>⚠️ Potential Risks:</h4>
                            <ul>
                              {routeResult.risks.map((risk: string, i: number) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="tab-content report-tab">
              <div className="report-form-container">
                <form onSubmit={handleReportIncident} className="report-form">
                  <h3>🚨 Report Unsafe Area or Incident</h3>
                  <p className="form-subtitle">Your report helps improve community safety and AI analysis</p>

                  <div className="form-group">
                    <label>Location</label>
                    <div className="coord-input">
                      <input
                        type="number"
                        placeholder="Latitude"
                        step="0.0001"
                        value={reportForm.lat}
                        onChange={(e) => setReportForm({ ...reportForm, lat: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Longitude"
                        step="0.0001"
                        value={reportForm.lng}
                        onChange={(e) => setReportForm({ ...reportForm, lng: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Severity Level</label>
                    <select
                      aria-label="Severity Level"
                      value={reportForm.severity}
                      onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                    >
                      <option value="LOW">🟢 Low - Minor concern</option>
                      <option value="MEDIUM">🟡 Medium - Notable issue</option>
                      <option value="HIGH">🔴 High - Serious incident</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea
                      placeholder="Describe the incident or concern (e.g., poor lighting, aggressive person, etc.)"
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '📤 Submitting...' : '📤 Submit Report'}
                  </button>
                </form>

                {reportStatus && (
                  <div className={`report-status ${reportStatus.error ? 'error' : 'success'}`}>
                    <p>{reportStatus.message || reportStatus.error}</p>
                    {reportStatus.reportsInArea && (
                      <p className="info-text">📍 {reportStatus.reportsInArea} reports in this area</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyAnalysisPage;
