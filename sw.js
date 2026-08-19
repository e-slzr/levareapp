const CACHE_NAME = "levare-cache-v2.0.2";
const ASSETS = [
  "./",
  "./index.php",
  "./assets/css/main.css?v=2.0.1",
  "./assets/js/db.js?v=2.0.2",
  "./assets/js/utils.js?v=2.0.2",
  "./assets/js/transposer.js?v=2.0.2",
  "./assets/js/app.js?v=2.0.2",
  "./icon-levareapp.svg?v=2.0.1",
  "./manifest.json?v=2.0.1"
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
  const url = e.request.url;
  const isApi = url.includes("/api/") || 
                url.includes("/api_native") || 
                url.includes("api_native") || 
                url.includes("/index.php/");
  const isLocal = url.startsWith(self.location.origin);

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

