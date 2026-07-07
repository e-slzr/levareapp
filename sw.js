const CACHE_NAME = "levare-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./assets/css/main.css?v=1.2.1",
  "./assets/js/db.js?v=1.2.3",
  "./assets/js/utils.js?v=1.2.3",
  "./assets/js/transposer.js?v=1.2.3",
  "./assets/js/app.js?v=1.2.3",
  "./icon.svg?v=1.0.1"
];

// Install Event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate for local assets, Network-Only for API
self.addEventListener("fetch", (e) => {
  const isApi = e.request.url.includes("/api/") || e.request.url.includes("/index.php/");
  const isLocal = e.request.url.startsWith(self.location.origin);

  if (isApi || !isLocal) {
    return; // Let browser handle it normally
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Update cache in background
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
