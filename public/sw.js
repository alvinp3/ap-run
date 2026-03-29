// BQ Training Service Worker
// Caches today's workout and static assets for offline use

const CACHE_NAME = 'bq-training-v1';
const OFFLINE_WORKOUT_URL = '/api/garmin/today';

// Static assets to precache
const PRECACHE_URLS = [
  '/',
  '/week',
  '/progress',
  '/offline',
];

// Install: precache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Fail silently — pages may not be built yet
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy:
// - /api/garmin/today → network-first, cache fallback (offline workout data)
// - /api/weather → network-first, cache fallback (stale weather ok)
// - navigation requests → network-first, cache fallback
// - static assets → cache-first
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // API routes: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Navigation: network-first, cache fallback, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Static assets (_next/static, fonts, images): cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
});

// Background sync: attempt to flush any queued workout logs
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workout-logs') {
    event.waitUntil(syncWorkoutLogs());
  }
});

async function syncWorkoutLogs() {
  // Reads pending logs from IndexedDB (if implemented) and POSTs to /api/logs
  // This is a stub — full implementation requires an IDB queue setup
  console.log('[SW] Background sync: workout logs');
}
