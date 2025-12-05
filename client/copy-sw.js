// Copy service worker to public folder during build
import fs from 'fs';
import path from 'path';

const sourceFile = path.join(process.cwd(), 'src', 'serviceWorker.ts');
const publicDir = path.join(process.cwd(), 'public');
const destFile = path.join(publicDir, 'serviceWorker.js');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Simple TypeScript to JavaScript transpilation for service worker
// In production, this would be handled by vite, but we create a simple version
const serviceWorkerCode = `
// Simple Service Worker
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'safety-zones-' + CACHE_VERSION;
const RUNTIME_CACHE = 'safety-zones-runtime-' + CACHE_VERSION;

const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json'];

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS_TO_CACHE).then(function() {
        self.skipWaiting();
      });
    })
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    fetch(request)
      .then(function(response) {
        if (response.ok) {
          caches.open(RUNTIME_CACHE).then(function(cache) {
            cache.put(request, response.clone());
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(request).then(function(cachedResponse) {
          if (cachedResponse) return cachedResponse;
          
          if (request.mode === 'navigate') {
            return caches.match('/index.html').then(function(response) {
              return response || new Response('Offline');
            });
          }
          
          return new Response('Not found', { status: 404 });
        });
      })
  );
});

// Push notification
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push notification received');
  
  var data = event.data ? event.data.json() : {};
  var options = {
    body: data.body || 'Safety Zones App',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'safety-notification',
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Safety Zones', options)
  );
});

// Notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url === '/' && 'focus' in clients[i]) {
          return clients[i].focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/dashboard');
      }
    })
  );
});
`;

// Write the service worker file
fs.writeFileSync(destFile, serviceWorkerCode, 'utf-8');
console.log('✅ Service Worker copied to public folder');
