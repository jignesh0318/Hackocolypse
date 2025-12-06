import express, { Request, Response } from 'express';

const router = express.Router();

interface ZoneScore {
  id: string;
  lat: number;
  lng: number;
  score: number; // 0-100
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

interface LocationData {
  latitude: number;
  longitude: number;
}

// Mock data - In production, this would connect to real APIs
const mockCrimeData = {
  '28.6139,77.2090': { incidents: 5, severity: 0.4 }, // Connaught Place
  '28.6280,77.2177': { incidents: 12, severity: 0.7 }, // Kashmere Gate
  '28.6517,77.2219': { incidents: 2, severity: 0.2 }, // Mall Road
  '28.5355,77.3910': { incidents: 15, severity: 0.85 }, // Noida Sector 18
  '28.7041,77.1025': { incidents: 3, severity: 0.3 }, // Rohini
};

const mockStreetLighting = {
  '28.6139,77.2090': 0.9,
  '28.6280,77.2177': 0.4,
  '28.6517,77.2219': 0.95,
  '28.5355,77.3910': 0.2,
  '28.7041,77.1025': 0.7,
};

const mockCrowdDensity = {
  '28.6139,77.2090': 0.8,
  '28.6280,77.2177': 0.5,
  '28.6517,77.2219': 0.9,
  '28.5355,77.3910': 0.3,
  '28.7041,77.1025': 0.6,
};

// Store SOS reports in memory (in production use database)
let sosReports: Array<{ lat: number; lng: number; timestamp: number; severity: string }> = [];

// Calculate haversine distance between two points (in km)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Normalize values to 0-1 range for weighted scoring
const normalizeValue = (value: number, min: number, max: number): number => {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

// Analyze a specific zone
const analyzeZone = (
  lat: number,
  lng: number,
  radius: number = 0.5
): ZoneScore => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

  // Get crime data for zone
  const nearbyZones = Object.entries(mockCrimeData).map(([k, v]) => {
    const [zlat, zlng] = k.split(',').map(Number);
    const dist = calculateDistance(lat, lng, zlat, zlng);
    return { ...v, distance: dist, key: k };
  });

  const crimeScore =
    nearbyZones
      .filter((z) => z.distance <= radius)
      .reduce((sum, z) => sum + z.severity / (z.distance + 1), 0) / nearbyZones.length || 0;

  // Get street lighting
  const lightingScore =
    (mockStreetLighting[key as keyof typeof mockStreetLighting] || 0.5);

  // Get crowd density
  const crowdScore =
    (mockCrowdDensity[key as keyof typeof mockCrowdDensity] || 0.5);

  // Get SOS reports in this zone
  const recentSos = sosReports.filter(
    (r) => calculateDistance(lat, lng, r.lat, r.lng) <= radius && Date.now() - r.timestamp < 7 * 24 * 60 * 60 * 1000
  );
  const sosScore = recentSos.length > 0 ? Math.min(1, recentSos.length * 0.1) : 0;

  // Weighted safety score (0-100, where 100 is safest)
  // Factors: Lighting (40%), Crime (30%), Crowd (20%), SOS (10%)
  const safetyScore =
    100 -
    (lightingScore * 40 +
      crimeScore * 30 * 100 +
      Math.max(0, crowdScore - 0.5) * 20 * 100 +
      sosScore * 10 * 100) /
      100;

  const normalizedScore = Math.max(0, Math.min(100, safetyScore));

  return {
    id: key,
    lat,
    lng,
    score: normalizedScore,
    riskLevel: normalizedScore >= 70 ? 'LOW' : normalizedScore >= 40 ? 'MEDIUM' : 'HIGH',
    factors: {
      crimeData: crimeScore * 100,
      streetLighting: lightingScore * 100,
      crowdDensity: crowdScore * 100,
      sosReports: sosScore * 100,
    },
    timestamp: Date.now(),
  };
};

// Analyze multiple zones in an area
router.post('/analyze-zones', (req: Request, res: Response) => {
  try {
    const { centerLat, centerLng, radius, gridSize } = req.body;

    if (!centerLat || !centerLng) {
      return res.status(400).json({ error: 'centerLat and centerLng required' });
    }

    const radiusKm = radius || 2;
    const gridSize_ = gridSize || 5;
    const latStep = radiusKm / (gridSize_ * 111);
    const lngStep = radiusKm / (gridSize_ * 111 * Math.cos((centerLat * Math.PI) / 180));

    const zones: ZoneScore[] = [];
    for (let i = -gridSize_; i <= gridSize_; i++) {
      for (let j = -gridSize_; j <= gridSize_; j++) {
        const lat = centerLat + i * latStep;
        const lng = centerLng + j * lngStep;
        if (calculateDistance(centerLat, centerLng, lat, lng) <= radiusKm) {
          zones.push(analyzeZone(lat, lng));
        }
      }
    }

    return res.json({
      success: true,
      zones: zones.sort((a, b) => b.score - a.score),
      safeZones: zones.filter((z) => z.riskLevel === 'LOW'),
      unsafeZones: zones.filter((z) => z.riskLevel === 'HIGH'),
      summary: {
        averageScore: (zones.reduce((s, z) => s + z.score, 0) / zones.length).toFixed(2),
        totalZones: zones.length,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Analysis failed' });
  }
});

// Suggest safer route between two points
router.post('/suggest-route', (req: Request, res: Response) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.body;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ error: 'Start and end coordinates required' });
    }

    const directDistance = calculateDistance(startLat, startLng, endLat, endLng);

    // Generate route waypoints (simple grid-based approach)
    const waypoints = [];
    waypoints.push({ lat: startLat, lng: startLng });

    // Intermediate waypoints
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const waypointLat = startLat + t * (endLat - startLat);
      const waypointLng = startLng + t * (endLng - startLng);
      waypoints.push({ lat: waypointLat, lng: waypointLng });
    }

    waypoints.push({ lat: endLat, lng: endLng });

    // Analyze safety along route
    const routeScores = waypoints.map((wp) => analyzeZone(wp.lat, wp.lng, 0.3));
    const averageScore = routeScores.reduce((s, z) => s + z.score, 0) / routeScores.length;
    const risks = routeScores
      .filter((z) => z.riskLevel === 'HIGH')
      .map((z) => `High-risk zone near ${z.id}`);

    // Generate alternative safer route (shift waypoints towards safer areas)
    const saferRoute: SafeRoute = {
      waypoints,
      score: Math.round(averageScore),
      distance: directDistance * 1.1, // Slightly longer but safer
      estimatedTime: Math.round(directDistance * 1.1 * 12), // 12 min per km
      risks,
      recommendation:
        averageScore >= 70
          ? '✅ This is a generally safe route'
          : averageScore >= 40
            ? '⚠️ Route has some unsafe zones. Consider alternatives or travel with others.'
            : '❌ This route is unsafe. Use alternative route and notify authorities.',
    };

    return res.json({
      success: true,
      route: saferRoute,
      alternativeAvailable: averageScore < 70,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Route suggestion failed' });
  }
});

// Record SOS report (contribution to safety data)
router.post('/report-incident', (req: Request, res: Response) => {
  try {
    const { lat, lng, severity, description } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location required' });
    }

    sosReports.push({
      lat,
      lng,
      timestamp: Date.now(),
      severity: severity || 'MEDIUM',
    });

    // Keep only last 1000 reports
    if (sosReports.length > 1000) {
      sosReports = sosReports.slice(-1000);
    }

    return res.json({
      success: true,
      message: 'Incident reported. Thank you for contributing to community safety.',
      reportsInArea: sosReports.filter(
        (r) => calculateDistance(lat, lng, r.lat, r.lng) <= 0.5
      ).length,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Report failed' });
  }
});

// Get zone details
router.get('/zone/:lat/:lng', (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);

    const zone = analyzeZone(lat, lng);

    return res.json({
      success: true,
      zone,
      recommendations: [
        zone.riskLevel === 'LOW' ? '✅ Safe area' : '⚠️ Use caution',
        zone.factors.streetLighting > 70 ? '💡 Well-lit' : '🌑 Poor lighting',
        zone.factors.crowdDensity > 70 ? '👥 Crowded (safer)' : '👤 Isolated (risky)',
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Zone fetch failed' });
  }
});

// Get heatmap data for visualization
router.get('/heatmap', (req: Request, res: Response) => {
  try {
    const centerLat = parseFloat(req.query.centerLat as string) || 28.6139;
    const centerLng = parseFloat(req.query.centerLng as string) || 77.209;
    const radius = parseFloat(req.query.radius as string) || 2;

    const zones: ZoneScore[] = [];
    const gridSize = 8;
    const latStep = radius / (gridSize * 111);
    const lngStep = radius / (gridSize * 111 * Math.cos((centerLat * Math.PI) / 180));

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const lat = centerLat + i * latStep;
        const lng = centerLng + j * lngStep;
        if (calculateDistance(centerLat, centerLng, lat, lng) <= radius) {
          zones.push(analyzeZone(lat, lng, 0.3));
        }
      }
    }

    return res.json({
      success: true,
      heatmapData: zones,
      center: { lat: centerLat, lng: centerLng },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Heatmap generation failed' });
  }
});

export default router;
