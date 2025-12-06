/**
 * Offline Storage Service
 * Handles offline data storage and synchronization
 */

interface OfflineData {
  id: string;
  type: 'sos' | 'location' | 'route' | 'incident';
  timestamp: number;
  data: any;
  synced: boolean;
}

class OfflineStorage {
  private dbName = 'SafetyZonesOfflineDB';
  private storeName = 'offlineData';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          objectStore.createIndex('type', 'type', { unique: false });
          objectStore.createIndex('synced', 'synced', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveOffline(type: string, data: any): Promise<string> {
    if (!this.db) await this.init();

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type: type as any,
      timestamp: Date.now(),
      data,
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(offlineData);

      request.onsuccess = () => {
        console.log(`💾 Saved offline ${type}:`, id);
        resolve(id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsynced(): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('synced');
      const results: OfflineData[] = [];
      
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (cursor.value.synced === false) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => {
            console.log(`✅ Marked as synced: ${id}`);
            resolve();
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAllByType(type: string): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSynced(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('synced');
      const request = index.openCursor(IDBKeyRange.only(true));

      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Store map tiles offline
  async cacheMapTile(url: string, blob: Blob): Promise<void> {
    try {
      const cache = await caches.open('map-tiles-cache');
      await cache.put(url, new Response(blob));
      console.log('🗺️ Cached map tile:', url);
    } catch (error) {
      console.error('Failed to cache map tile:', error);
    }
  }

  async getCachedMapTile(url: string): Promise<Blob | null> {
    try {
      const cache = await caches.open('map-tiles-cache');
      const response = await cache.match(url);
      return response ? await response.blob() : null;
    } catch (error) {
      console.error('Failed to get cached map tile:', error);
      return null;
    }
  }
}

export default new OfflineStorage();
