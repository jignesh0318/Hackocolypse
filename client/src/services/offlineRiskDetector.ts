/**
 * Offline Risk Zone Detector
 * Detects risky areas even without network connection
 * Uses pre-cached risk data and GPS to alert users
 */

interface RiskZone {
  lat: number;
  lng: number;
  radius: number; // meters
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  type: string; // 'crime', 'poorly_lit', 'isolated', etc.
  lastUpdated: number;
}

interface CachedRiskData {
  zones: RiskZone[];
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  cachedAt: number;
}

class OfflineRiskDetector {
  private cachedRiskZones: RiskZone[] = [];
  private currentPosition: { lat: number; lng: number } | null = null;
  private watchId: number | null = null;
  private alertShown: Set<string> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;

  // Pre-defined high-risk areas (updated when online)
  private knownRiskAreas: RiskZone[] = [
    // These are examples - will be replaced with real data when online
    { lat: 28.6139, lng: 77.2090, radius: 500, riskLevel: 'HIGH', type: 'crime_hotspot', lastUpdated: Date.now() },
    { lat: 28.6500, lng: 77.2300, radius: 300, riskLevel: 'MEDIUM', type: 'poorly_lit', lastUpdated: Date.now() },
  ];

  async init() {
    // Load cached risk zones from storage
    await this.loadCachedRiskZones();
    
    // Start GPS monitoring
    this.startGPSMonitoring();
    
    // Check proximity every 10 seconds
    this.startProximityCheck();
    
    console.log('🛡️ Offline Risk Detector initialized with', this.cachedRiskZones.length, 'cached zones');
  }

  async loadCachedRiskZones() {
    try {
      const cached = localStorage.getItem('cachedRiskZones');
      if (cached) {
        const data: CachedRiskData = JSON.parse(cached);
        
        // Check if cache is not too old (7 days)
        const cacheAge = Date.now() - data.cachedAt;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (cacheAge < maxAge) {
          this.cachedRiskZones = data.zones;
          console.log('✅ Loaded', data.zones.length, 'cached risk zones');
        } else {
          console.warn('⚠️ Cached risk data is old, using default zones');
          this.cachedRiskZones = this.knownRiskAreas;
        }
      } else {
        this.cachedRiskZones = this.knownRiskAreas;
      }
    } catch (error) {
      console.error('Failed to load cached risk zones:', error);
      this.cachedRiskZones = this.knownRiskAreas;
    }
  }

  async cacheRiskZones(zones: RiskZone[], centerLat: number, centerLng: number, radiusKm: number) {
    const data: CachedRiskData = {
      zones,
      centerLat,
      centerLng,
      radiusKm,
      cachedAt: Date.now(),
    };
    
    localStorage.setItem('cachedRiskZones', JSON.stringify(data));
    this.cachedRiskZones = zones;
    console.log('💾 Cached', zones.length, 'risk zones for offline use');
  }

  startGPSMonitoring() {
    if (!navigator.geolocation) {
      console.warn('Geolocation not available');
      return;
    }

    // Watch position continuously
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        // Save last known position
        localStorage.setItem('lastKnownPosition', JSON.stringify(this.currentPosition));
      },
      (error) => {
        console.error('GPS error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }

  startProximityCheck() {
    // Check every 10 seconds
    this.checkInterval = setInterval(() => {
      this.checkNearbyRisks();
    }, 10000);
  }

  checkNearbyRisks() {
    if (!this.currentPosition) {
      console.warn('No GPS position available');
      return;
    }

    const nearbyRisks = this.findNearbyRiskZones(this.currentPosition.lat, this.currentPosition.lng);

    for (const risk of nearbyRisks) {
      const alertId = `${risk.lat}_${risk.lng}`;
      
      // Don't show same alert twice in 30 minutes
      if (this.alertShown.has(alertId)) continue;

      // Calculate distance
      const distance = this.calculateDistance(
        this.currentPosition.lat,
        this.currentPosition.lng,
        risk.lat,
        risk.lng
      );

      // Alert if within risk radius
      if (distance <= risk.radius) {
        this.showRiskAlert(risk, distance);
        this.alertShown.add(alertId);
        
        // Remove from alert history after 30 minutes
        setTimeout(() => this.alertShown.delete(alertId), 30 * 60 * 1000);
      }
    }
  }

  findNearbyRiskZones(lat: number, lng: number, searchRadiusMeters: number = 1000): RiskZone[] {
    return this.cachedRiskZones.filter((zone) => {
      const distance = this.calculateDistance(lat, lng, zone.lat, zone.lng);
      return distance <= searchRadiusMeters;
    });
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula - calculates distance in meters
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  showRiskAlert(risk: RiskZone, distance: number) {
    const riskEmoji = risk.riskLevel === 'HIGH' ? '🔴' : risk.riskLevel === 'MEDIUM' ? '🟡' : '🟢';
    const distanceText = distance < 100 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`;
    
    const message = `${riskEmoji} ${risk.riskLevel} RISK ZONE AHEAD!\n\n` +
                    `Type: ${risk.type.replace('_', ' ').toUpperCase()}\n` +
                    `Distance: ${distanceText}\n\n` +
                    `⚠️ Stay alert! Consider taking an alternate route.`;

    // Show browser notification
    this.showNotification('⚠️ Risk Zone Detected', {
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      requireInteraction: true,
      tag: 'risk-alert',
    });

    // Show alert dialog
    alert(message);

    // Vibrate phone (if supported)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Log the alert
    this.logRiskAlert(risk, distance);
  }

  showNotification(title: string, options: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  logRiskAlert(risk: RiskZone, distance: number) {
    const alerts = JSON.parse(localStorage.getItem('riskAlerts') || '[]');
    alerts.unshift({
      timestamp: new Date().toISOString(),
      riskLevel: risk.riskLevel,
      type: risk.type,
      distance: Math.round(distance),
      location: { lat: this.currentPosition?.lat, lng: this.currentPosition?.lng },
      offline: !navigator.onLine,
    });

    // Keep only last 50 alerts
    if (alerts.length > 50) alerts.pop();
    
    localStorage.setItem('riskAlerts', JSON.stringify(alerts));
  }

  // Predictive risk based on time of day and historical data
  getPredictiveRisk(lat: number, lng: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    const hour = new Date().getHours();
    
    // Night time (10 PM - 6 AM) increases risk
    const isNight = hour >= 22 || hour <= 6;
    
    // Check if in known risk area
    const nearbyRisks = this.findNearbyRiskZones(lat, lng, 500);
    
    if (nearbyRisks.some(r => r.riskLevel === 'HIGH')) {
      return 'HIGH';
    }
    
    if (isNight && nearbyRisks.length > 0) {
      return 'HIGH';
    }
    
    if (nearbyRisks.some(r => r.riskLevel === 'MEDIUM') || isNight) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  // Check if route passes through risk zones
  async analyzeRoute(waypoints: { lat: number; lng: number }[]): Promise<{
    hasRisks: boolean;
    riskZones: RiskZone[];
    recommendation: string;
  }> {
    const risksOnRoute: RiskZone[] = [];

    for (const point of waypoints) {
      const nearbyRisks = this.findNearbyRiskZones(point.lat, point.lng, 200);
      risksOnRoute.push(...nearbyRisks);
    }

    // Remove duplicates
    const uniqueRisks = Array.from(new Set(risksOnRoute.map(r => `${r.lat}_${r.lng}`)))
      .map(key => risksOnRoute.find(r => `${r.lat}_${r.lng}` === key)!);

    const highRiskCount = uniqueRisks.filter(r => r.riskLevel === 'HIGH').length;

    let recommendation = '';
    if (highRiskCount > 0) {
      recommendation = `⚠️ This route passes through ${highRiskCount} high-risk zone(s). Consider alternate route or travel in groups.`;
    } else if (uniqueRisks.length > 0) {
      recommendation = `⚡ Route has ${uniqueRisks.length} medium-risk area(s). Stay alert and avoid isolated areas.`;
    } else {
      recommendation = `✅ Route appears safe based on cached data. Stay aware of surroundings.`;
    }

    return {
      hasRisks: uniqueRisks.length > 0,
      riskZones: uniqueRisks,
      recommendation,
    };
  }

  stop() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getCurrentPosition() {
    return this.currentPosition;
  }

  getRiskZoneCount() {
    return this.cachedRiskZones.length;
  }

  getAlertHistory() {
    return JSON.parse(localStorage.getItem('riskAlerts') || '[]');
  }
}

export default new OfflineRiskDetector();
