/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Cache names
const CACHE_VERSION = 'v1';
const CACHE_NAME = `safety-zones-${CACHE_VERSION}`;
const RUNTIME_CACHE = `safety-zones-runtime-${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS_TO_CACHE);
        console.log('Service Worker: Essential assets cached');
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('Service Worker: Install failed', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        // Claim all clients immediately
        await self.clients.claim();
        console.log('Service Worker: Activated');
      } catch (error) {
        console.error('Service Worker: Activation failed', error);
      }
    })()
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        // Network failed, try cache
        console.log('Network failed for:', request.url, 'Using cache...');
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback for navigation requests
        if (request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          const fallbackResponse = await cache.match('/index.html');
          if (fallbackResponse) {
            return fallbackResponse;
          }
          return new Response('Offline - Please check your connection');
        }

        return new Response('Resource not found', {
          status: 404,
          statusText: 'Not Found',
        });
      }
    })()
  );
});

// Background Sync for route data (when connection restored)
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-route-data') {
    event.waitUntil(
      (async () => {
        try {
          // Get route data from IndexedDB or localStorage
          console.log('Service Worker: Syncing route data...');
          // In production, send to backend here
        } catch (error) {
          console.error('Service Worker: Sync failed', error);
        }
      })()
    );
  }
});

// Push notification event
self.addEventListener('push', (event: PushEvent) => {
  console.log('Service Worker: Push notification received');

  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'Safety Zones App',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'safety-notification',
    requireInteraction: data.requireInteraction ?? true,
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Safety Zones', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window' });

      // Check if app is already open
      for (const client of clients) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }

      // Open app if not already open
      if (self.clients.openWindow) {
        return self.clients.openWindow('/dashboard');
      }
    })()
  );
});

export {};
