const CACHE_NAME = "levare-cache-v2.0.4";
const ASSETS = [
  "./",
  "./index.php",
  "./assets/css/main.css?v=2.0.1",
  "./assets/js/db.js?v=2.0.3",
  "./assets/js/utils.js?v=2.0.3",
  "./assets/js/transposer.js?v=2.0.2",
  "./assets/js/app.js?v=2.0.3",
  "./assets/js/push.js?v=2.0.3",
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
