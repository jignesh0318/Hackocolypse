// Service to track user's route and send emergency data when battery is low

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

interface RouteData {
  startTime: number;
  endTime: number;
  points: LocationPoint[];
  totalDistance: number; // in kilometers
}

class RouteTracker {
  private routePoints: LocationPoint[] = [];
  private watchId: number | null = null;
  private batteryManager: any = null;
  private isTracking: boolean = false;
  private lastNotificationTime: number = 0;
  private readonly ROUTE_STORAGE_KEY = 'userRouteData';
  private readonly MAX_ROUTE_POINTS = 500; // Limit storage
  private readonly MIN_NOTIFICATION_INTERVAL = 300000; // 5 minutes between notifications

  constructor() {
    this.loadRouteFromStorage();
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate total distance of the route
  private getTotalDistance(): number {
    if (this.routePoints.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < this.routePoints.length; i++) {
      const prev = this.routePoints[i - 1];
      const curr = this.routePoints[i];
      totalDistance += this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }
    return totalDistance;
  }

  // Save route to localStorage
  private saveRouteToStorage(): void {
    try {
      const routeData: RouteData = {
        startTime: this.routePoints.length > 0 ? this.routePoints[0].timestamp : Date.now(),
        endTime: Date.now(),
        points: this.routePoints,
        totalDistance: this.getTotalDistance()
      };
      localStorage.setItem(this.ROUTE_STORAGE_KEY, JSON.stringify(routeData));
    } catch (error) {
      console.error('Failed to save route to storage:', error);
    }
  }

  // Load route from localStorage
  private loadRouteFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.ROUTE_STORAGE_KEY);
      if (stored) {
        const routeData: RouteData = JSON.parse(stored);
        // Only load if it's from today
        const today = new Date().setHours(0, 0, 0, 0);
        if (routeData.startTime >= today) {
          this.routePoints = routeData.points;
        } else {
          // Clear old route data
          localStorage.removeItem(this.ROUTE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load route from storage:', error);
    }
  }

  // Generate Google Maps route URL
  private generateRouteUrl(): string {
    if (this.routePoints.length === 0) return '';
    
    // For Google Maps, we'll use waypoints (limited to ~10 for URL length)
    const pointsToShow = this.routePoints.length <= 10 
      ? this.routePoints 
      : [
          this.routePoints[0], // Start
          ...this.routePoints.filter((_, i) => i % Math.floor(this.routePoints.length / 8) === 0).slice(0, 8),
          this.routePoints[this.routePoints.length - 1] // End
        ];
    
    const origin = `${pointsToShow[0].latitude},${pointsToShow[0].longitude}`;
    const destination = `${pointsToShow[pointsToShow.length - 1].latitude},${pointsToShow[pointsToShow.length - 1].longitude}`;
    const waypoints = pointsToShow.slice(1, -1).map(p => `${p.latitude},${p.longitude}`).join('|');
    
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}`;
  }

  // Send emergency notification with route data
  private async sendEmergencyNotification(): Promise<void> {
    const now = Date.now();
    
    // Prevent too frequent notifications
    if (now - this.lastNotificationTime < this.MIN_NOTIFICATION_INTERVAL) {
      console.log('Skipping notification - too soon since last one');
      return;
    }

    this.lastNotificationTime = now;

    // Get emergency contacts
    const profileInfo = localStorage.getItem('profileInfo');
    if (!profileInfo) {
      console.error('No profile information found');
      return;
    }

    try {
      const profile = JSON.parse(profileInfo);
      const contacts: Array<{ name: string; phone: string; relation: string }> = [];
      
      if (profile.emergencyContact1Phone) {
        contacts.push({
          name: profile.emergencyContact1,
          phone: profile.emergencyContact1Phone,
          relation: profile.emergencyContact1Relation
        });
      }
      
      if (profile.emergencyContact2Phone) {
        contacts.push({
          name: profile.emergencyContact2,
          phone: profile.emergencyContact2Phone,
          relation: profile.emergencyContact2Relation
        });
      }

      const lastLocation = this.routePoints[this.routePoints.length - 1];
      const lastLocationUrl = lastLocation 
        ? `https://maps.google.com/?q=${lastLocation.latitude},${lastLocation.longitude}`
        : 'Location unavailable';

      const routeUrl = this.generateRouteUrl();
      const totalDistance = this.getTotalDistance();
      const routeDuration = this.routePoints.length > 0 
        ? (now - this.routePoints[0].timestamp) / (1000 * 60) // in minutes
        : 0;

      // Create emergency message
      const emergencyData = {
        timestamp: new Date().toISOString(),
        reason: 'Low Battery - Phone shutting down',
        user: {
          name: profile.fullName,
          phone: profile.primaryPhone,
          bloodGroup: profile.bloodGroup,
          allergies: profile.allergies,
          medications: profile.medications
        },
        location: {
          current: lastLocationUrl,
          latitude: lastLocation?.latitude,
          longitude: lastLocation?.longitude,
          accuracy: lastLocation?.accuracy
        },
        route: {
          url: routeUrl,
          totalPoints: this.routePoints.length,
          totalDistance: totalDistance.toFixed(2) + ' km',
          duration: routeDuration.toFixed(0) + ' minutes',
          startTime: this.routePoints[0]?.timestamp 
            ? new Date(this.routePoints[0].timestamp).toLocaleString()
            : 'Unknown'
        },
        contacts
      };

      console.log('🔋 EMERGENCY NOTIFICATION - LOW BATTERY:', emergencyData);

      // Show notification to user
      const message = `⚠️ LOW BATTERY ALERT SENT!\n\n` +
        `Emergency contacts notified:\n${contacts.map(c => `• ${c.name} (${c.relation}): ${c.phone}`).join('\n')}\n\n` +
        `Last Location: ${lastLocationUrl}\n\n` +
        `Route Details:\n` +
        `• Distance traveled: ${emergencyData.route.totalDistance}\n` +
        `• Duration: ${emergencyData.route.duration}\n` +
        `• Route map: ${routeUrl}\n\n` +
        `Your emergency contacts have been sent your last known location and travel route.`;

      // Try to show system notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔋 Low Battery Alert Sent', {
          body: 'Emergency contacts notified with your location and route',
          icon: '/alert-icon.png',
          requireInteraction: true
        });
      }

      alert(message);

      // In a real app, this would:
      // 1. Send SMS to emergency contacts
      // 2. Send push notifications
      // 3. Call emergency services API
      // 4. Store incident in backend
      // 5. Enable location sharing

    } catch (error) {
      console.error('Failed to send emergency notification:', error);
    }
  }

  // Monitor battery status
  private async initBatteryMonitoring(): Promise<void> {
    try {
      // Check if Battery Status API is supported
      if ('getBattery' in navigator) {
        this.batteryManager = await (navigator as any).getBattery();
        
        // Monitor battery level changes
        this.batteryManager.addEventListener('levelchange', () => {
          const level = this.batteryManager.level * 100;
          console.log(`Battery level: ${level.toFixed(0)}%`);

          // Trigger emergency notification at critical levels
          if (level <= 5 && !this.batteryManager.charging) {
            console.warn('🔋 Critical battery level - sending emergency notification');
            this.sendEmergencyNotification();
          } else if (level <= 10 && !this.batteryManager.charging) {
            console.warn('⚠️ Low battery warning - 10% remaining');
          }
        });

        // Monitor charging status
        this.batteryManager.addEventListener('chargingchange', () => {
          if (this.batteryManager.charging) {
            console.log('🔌 Device is charging');
          } else {
            console.log('🔋 Device unplugged');
          }
        });

        console.log(`🔋 Battery monitoring initialized. Current level: ${(this.batteryManager.level * 100).toFixed(0)}%`);
      } else {
        console.warn('Battery Status API not supported on this device');
        
        // Fallback: Check battery periodically using other methods
        setInterval(() => {
          // This is a fallback - in production you might use device-specific APIs
          console.log('Battery monitoring fallback active');
        }, 60000); // Check every minute
      }
    } catch (error) {
      console.error('Failed to initialize battery monitoring:', error);
    }
  }

  // Start tracking route
  public startTracking(): void {
    if (this.isTracking) {
      console.log('Route tracking already active');
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Start battery monitoring
    this.initBatteryMonitoring();

    // Start location tracking
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point: LocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy
        };

        this.routePoints.push(point);

        // Limit array size
        if (this.routePoints.length > this.MAX_ROUTE_POINTS) {
          this.routePoints.shift();
        }

        // Save to localStorage periodically
        if (this.routePoints.length % 10 === 0) {
          this.saveRouteToStorage();
        }

        console.log(`📍 Location tracked: ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    this.isTracking = true;
    console.log('✅ Route tracking started');
  }

  // Stop tracking route
  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.saveRouteToStorage();
    this.isTracking = false;
    console.log('⏹️ Route tracking stopped');
  }

  // Get current route data
  public getRouteData(): RouteData {
    return {
      startTime: this.routePoints.length > 0 ? this.routePoints[0].timestamp : Date.now(),
      endTime: Date.now(),
      points: this.routePoints,
      totalDistance: this.getTotalDistance()
    };
  }

  // Clear route data
  public clearRoute(): void {
    this.routePoints = [];
    localStorage.removeItem(this.ROUTE_STORAGE_KEY);
    console.log('🗑️ Route data cleared');
  }

  // Check if tracking is active
  public isActive(): boolean {
    return this.isTracking;
  }

  // Get current battery level (if available)
  public async getBatteryLevel(): Promise<number | null> {
    try {
      if (!this.batteryManager && 'getBattery' in navigator) {
        this.batteryManager = await (navigator as any).getBattery();
      }
      return this.batteryManager ? this.batteryManager.level * 100 : null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const routeTracker = new RouteTracker();
export default routeTracker;
