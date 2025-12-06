/**
 * Offline Manager Service
 * Manages offline functionality and background sync
 */

import offlineStorage from './offlineStorage';
import offlineRiskDetector from './offlineRiskDetector';
import { sendSOSAlert } from './api';

class OfflineManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;

  init() {
    // Initialize offline storage
    offlineStorage.init();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Check connection periodically
    this.startPeriodicSync();

    console.log('🔌 Offline Manager initialized. Status:', this.isOnline ? 'Online' : 'Offline');
  }

  handleOnline() {
    this.isOnline = true;
    console.log('✅ Connection restored - Starting sync...');
    
    // Show notification
    this.showNotification('Connection Restored', {
      body: 'Syncing offline data...',
      icon: '/icons/icon-192x192.png',
    });

    // Sync all pending data
    this.syncPendingData();
    
    // Fetch fresh risk zones for offline protection
    this.fetchAndCacheRiskZones();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('📴 Connection lost - Offline mode active');
    
    // Show notification
    this.showNotification('Offline Mode Active', {
      body: 'App will continue working. Data will sync when connection is restored.',
      icon: '/icons/icon-192x192.png',
    });
  }

  async syncPendingData() {
    try {
      const unsyncedData = await offlineStorage.getUnsynced();
      
      if (unsyncedData.length === 0) {
        console.log('✅ No pending data to sync');
        return;
      }

      console.log(`🔄 Syncing ${unsyncedData.length} pending items...`);

      for (const item of unsyncedData) {
        try {
          await this.syncItem(item);
          await offlineStorage.markAsSynced(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }

      console.log('✅ Sync completed');
      
      // Clean up old synced data
      await offlineStorage.clearSynced();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  async syncItem(item: any) {
    switch (item.type) {
      case 'sos':
        return await sendSOSAlert(item.data);
      case 'incident':
        // Sync incident report
        return await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
      case 'location':
        // Sync location update
        console.log('Location synced:', item.data);
        return;
      case 'route':
        // Sync route data
        console.log('Route synced:', item.data);
        return;
      default:
        console.warn('Unknown sync type:', item.type);
    }
  }

  startPeriodicSync() {
    // Try to sync every 30 seconds if online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingData();
      }
    }, 30000);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async saveForLater(type: string, data: any): Promise<string> {
    const id = await offlineStorage.saveOffline(type, data);
    
    this.showNotification('Saved Offline', {
      body: `${type} will be synced when connection is restored.`,
      icon: '/icons/icon-192x192.png',
    });

    return id;
  }

  showNotification(title: string, options: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      hasServiceWorker: 'serviceWorker' in navigator,
      notificationsEnabled: 'Notification' in window && Notification.permission === 'granted',
    };
  }

  // Cache current location for offline use
  async cacheCurrentLocation(lat: number, lng: number) {
    const location = { lat, lng, timestamp: Date.now() };
    localStorage.setItem('lastKnownLocation', JSON.stringify(location));
  }

  getLastKnownLocation(): { lat: number; lng: number; timestamp: number } | null {
    const cached = localStorage.getItem('lastKnownLocation');
    return cached ? JSON.parse(cached) : null;
  }

  // Cache emergency contacts for offline access
  cacheEmergencyContacts(contacts: any[]) {
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
  }

  getEmergencyContacts(): any[] {
    const cached = localStorage.getItem('emergencyContacts');
    return cached ? JSON.parse(cached) : [];
  }

  // Cache user profile for offline access
  cacheUserProfile(profile: any) {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  getUserProfile(): any | null {
    const cached = localStorage.getItem('userProfile');
    return cached ? JSON.parse(cached) : null;
  }

  // Fetch and cache risk zones for offline protection
  async fetchAndCacheRiskZones() {
    try {
      // Get user's current location
      const lastPos = this.getLastKnownLocation();
      if (!lastPos) {
        console.log('⚠️ No location available to fetch risk zones');
        return;
      }

      console.log('📥 Fetching risk zones for offline protection...');

      // Fetch risk zones from API (within 10km radius)
      const response = await fetch(`/api/risk-zones?lat=${lastPos.lat}&lng=${lastPos.lng}&radius=10000`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch risk zones');
      }

      const data = await response.json();
      const riskZones = data.zones || [];

      // Cache in offline risk detector
      await offlineRiskDetector.cacheRiskZones(
        riskZones,
        lastPos.lat,
        lastPos.lng,
        10 // 10km radius
      );

      console.log('✅ Cached', riskZones.length, 'risk zones for offline use');
      
      this.showNotification('Risk Zones Updated', {
        body: `Downloaded ${riskZones.length} nearby risk zones for offline protection`,
        icon: '/icons/icon-192x192.png',
      });
    } catch (error) {
      console.error('Failed to fetch risk zones:', error);
      // Continue with cached data
    }
  }
}

export default new OfflineManager();
