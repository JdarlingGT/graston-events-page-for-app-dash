// Basic service worker setup for caching and offline capabilities

// Cache name
const CACHE_NAME = 'my-app-cache-v1';

// Files to cache
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  // Add more files as needed
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Background Sync
        self.addEventListener('sync', (event) => {
          if (event.tag === 'sync-data') {
            event.waitUntil(syncData());
          }
        });
        
        function syncData() {
          // Example function to sync data
          return fetch('/api/sync', {
            method: 'POST',
            body: JSON.stringify({ data: 'example data' }),
            headers: {
              'Content-Type': 'application/json'
            // Push Notifications
            self.addEventListener('push', (event) => {
              const data = event.data ? event.data.json() : {};
              const title = data.title || 'New Notification';
              const options = {
                body: data.body || 'You have a new message.',
                icon: data.icon || '/icon.png',
                badge: data.badge || '/badge.png',
              };
            
              event.waitUntil(
                self.registration.showNotification(title, options)
              );
            });
            
            self.addEventListener('notificationclick', (event) => {
              event.notification.close();
              event.waitUntil(
                clients.openWindow('/')
              );
            });
          })
          .then(response => response.json())
          .then(data => {
            console.log('Data synced successfully:', data);
          })
          .catch(error => {
            console.error('Error syncing data:', error);
          });
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});