// Service Worker for Safety Zones PWA
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'safety-zones-' + CACHE_VERSION;
const RUNTIME_CACHE = 'safety-zones-runtime-' + CACHE_VERSION;

const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json'];

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

// Fetch event - Network first strategy
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    fetch(request)
      .then(function(response) {
        // Cache successful responses
        if (response.ok) {
          var cache_clone = response.clone();
          caches.open(RUNTIME_CACHE).then(function(cache) {
            cache.put(request, cache_clone);
          });
        }
        return response;
      })
      .catch(function(error) {
        console.log('📡 Network request failed, trying cache:', request.url);
        
        // Try to get from cache
        return caches.match(request).then(function(cachedResponse) {
          if (cachedResponse) {
            console.log('✅ Serving from cache:', request.url);
            return cachedResponse;
          }
          
          // For navigation requests, return offline page
          if (request.mode === 'navigate') {
            return caches.match('/index.html').then(function(response) {
              return response || new Response('Offline - Please check your connection', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
          }
          
          console.warn('⚠️  Resource not found:', request.url);
          return new Response('Not found', { 
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
