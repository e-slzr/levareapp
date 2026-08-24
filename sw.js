const CACHE_NAME = "levare-cache-v2.0.7";
const ASSETS = [
  "./",
  "./index.php",
  "./assets/css/main.css",
  "./assets/js/db.js",
  "./assets/js/utils.js",
  "./assets/js/chordParser.js",
  "./assets/js/transposer.js",
  "./assets/js/app.js",
  "./assets/js/push.js",
  "./icon-levareapp.svg",
  "./manifest.json"
];


// Install Event
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
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

// Fetch Event - Network-First for static assets, Network-Only for API
self.addEventListener("fetch", (e) => {
  if (e.request.method !== 'GET') return;

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
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});

// ==============================================================================
// Web Push Notifications Event Listeners (Background Push & Click Handler)
// ==============================================================================

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: "Levare",
        body: event.data.text()
      };
    }
  }

  const title = data.title || "Levare";

  const iconUrl = new URL("icon-levareapp.png", self.location.origin).href;
  const options = {
    body: data.body || "Tienes una nueva actualización en tu grupo musical.",
    icon: iconUrl,
    badge: iconUrl,
    vibrate: [100, 50, 100],
    tag: data.tag || ("levare-notif-" + Date.now()),
    renotify: true,
    data: data.data || { url: "./" }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});



self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || "./";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and notify SPA router
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.postMessage({
            type: "PUSH_NOTIFICATION_CLICKED",
            data: notifData,
            targetUrl: targetUrl
          });
          return;
        }
      }
      // If no window is currently open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
