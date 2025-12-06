import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/safety-analysis';

interface ZoneScore {
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
  timestamp: number;
}

interface SafeRoute {
  waypoints: Array<{ lat: number; lng: number }>;
  score: number;
  distance: number;
  estimatedTime: number;
  risks: string[];
  recommendation: string;
}

export const safetyAnalysisService = {
  // Analyze zones in an area
  async analyzeZones(centerLat: number, centerLng: number, radius: number = 2, gridSize: number = 5) {
    try {
      const response = await axios.post(`${API_BASE}/analyze-zones`, {
        centerLat,
        centerLng,
        radius,
        gridSize,
      });
      return response.data;
    } catch (error) {
      console.error('Zone analysis failed:', error);
      throw error;
    }
  },

  // Get suggestion for safer route
  async suggestRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
    try {
      const response = await axios.post(`${API_BASE}/suggest-route`, {
        startLat,
        startLng,
        endLat,
        endLng,
      });
      return response.data;
    } catch (error) {
      console.error('Route suggestion failed:', error);
      throw error;
    }
  },

  // Report an incident to improve data
  async reportIncident(lat: number, lng: number, severity: string = 'MEDIUM', description?: string) {
    try {
      const response = await axios.post(`${API_BASE}/report-incident`, {
        lat,
        lng,
        severity,
        description,
      });
      return response.data;
    } catch (error) {
      console.error('Incident report failed:', error);
      throw error;
    }
  },

  // Get detailed zone analysis
  async getZoneDetails(lat: number, lng: number) {
    try {
      const response = await axios.get(`${API_BASE}/zone/${lat}/${lng}`);
      return response.data;
    } catch (error) {
      console.error('Zone details fetch failed:', error);
      throw error;
    }
  },

  // Get heatmap data for visualization
  async getHeatmapData(centerLat: number, centerLng: number, radius: number = 2) {
    try {
      const response = await axios.get(`${API_BASE}/heatmap`, {
        params: {
          centerLat,
          centerLng,
          radius,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Heatmap fetch failed:', error);
      throw error;
    }
  },
};

export default safetyAnalysisService;
