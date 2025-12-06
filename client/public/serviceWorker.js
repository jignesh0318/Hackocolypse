// Service Worker for Safety Zones PWA - Enhanced Offline Support
const CACHE_VERSION = 'v3';
const CACHE_NAME = 'safety-zones-' + CACHE_VERSION;
const RUNTIME_CACHE = 'safety-zones-runtime-' + CACHE_VERSION;
const MAP_CACHE = 'safety-zones-maps-' + CACHE_VERSION;

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add more critical assets for offline
];

// Resources that should work offline
const OFFLINE_PAGES = [
  '/',
  '/dashboard',
  '/login',
  '/personal-info',
];

// Install event
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('📦 Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE).then(function() {
        self.skipWaiting();
      });
    }).catch(function(error) {
      console.error('❌ Installation failed:', error);
    })
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('✨ Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('🗑️  Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch event - Cache first for assets, Network first for API
self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests except maps
  if (!request.url.startsWith(self.location.origin) && 
      !request.url.includes('googleapis.com')) {
    return;
  }

  // Cache strategy for map tiles
  if (request.url.includes('maps.googleapis.com') || request.url.includes('maps.gstatic.com')) {
    event.respondWith(
      caches.open(MAP_CACHE).then(function(cache) {
        return cache.match(request).then(function(cachedResponse) {
          if (cachedResponse) {
            console.log('🗺️ Serving map tile from cache');
            return cachedResponse;
          }
          return fetch(request).then(function(response) {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(function() {
            // Return placeholder for missing map tiles
            return new Response('', { status: 200 });
          });
        });
      })
    );
    return;
  }
  
  // API requests - Network first, cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          if (response.ok) {
            var cache_clone = response.clone();
            caches.open(RUNTIME_CACHE).then(function(cache) {
              cache.put(request, cache_clone);
            });
          }
          return response;
        })
        .catch(function() {
          console.log('📡 API offline, trying cache');
          return caches.match(request).then(function(cached) {
            return cached || new Response(JSON.stringify({
              offline: true,
              message: 'Data will sync when connection is restored'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }
  
  // Static assets - Cache first
  event.respondWith(
    caches.match(request).then(function(cachedResponse) {
      if (cachedResponse) {
        console.log('✅ Serving from cache:', request.url);
        return cachedResponse;
      }
      
      return fetch(request).then(function(response) {
        if (response.ok) {
          var cache_clone = response.clone();
          caches.open(RUNTIME_CACHE).then(function(cache) {
            cache.put(request, cache_clone);
          });
        }
        return response;
      }).catch(function(error) {
        console.log('📡 Network failed for:', request.url);
        
        // For navigation, return index.html
        if (request.mode === 'navigate') {
          return caches.match('/index.html').then(function(response) {
            return response || new Response('Offline - App cached for offline use', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
        }
        
        return new Response('Resource unavailable offline', { 
          status: 404,
          statusText: 'Not Found'
        });
      });
    })
  );
});

// Background Sync for route data
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-route-data') {
    console.log('🔄 Service Worker: Syncing route data...');
    event.waitUntil(
      new Promise(function(resolve) {
        // In production, send route data to backend here
        resolve(undefined);
      })
    );
  }
});

// Push notification event
self.addEventListener('push', function(event) {
  console.log('🔔 Service Worker: Push notification received');
  
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Failed to parse push data:', e);
  }
  
  var options = {
    body: data.body || 'Safety Zones App notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'safety-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '🚨 Safety Zones Alert', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  console.log('🖱️  Notification clicked:', event.action);
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url === '/' && 'focus' in clients[i]) {
          console.log('✨ Focusing existing window');
          return clients[i].focus();
        }
      }
      if (self.clients.openWindow) {
        console.log('🪟 Opening new window');
        return self.clients.openWindow('/dashboard');
      }
    })
  );
});

console.log('✅ Service Worker loaded successfully');
