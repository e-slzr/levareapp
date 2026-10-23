const CACHE_NAME = "levare-cache-v2.1.1";
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
    data: Object.assign({}, data.data || {}, {
      url: (data.data && data.data.url) || data.url || "./"
    })
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  let rawUrl = notifData.url || "./";

  // Si la ruta viene en formato hash (#vista), anteponer './' para que resuelva sobre el scope de la SPA
  if (rawUrl.startsWith("#")) {
    rawUrl = "./" + rawUrl;
  }

  // Resolver la URL SIEMPRE sobre el scope de la aplicación registrada (ej. https://dominio.com/),
  // NUNCA sobre self.location (que apuntaría al archivo sw.js)
  const targetUrl = new URL(rawUrl, self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 1. Si ya existe una ventana abierta de la app, enfocarla y emitir mensaje interno al enrutador
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && "focus" in client) {
          // Si por error previo la ventana quedó atrapada en sw.js, redirigirla a la app
          if (client.url.includes("sw.js") && "navigate" in client) {
            return client.navigate(targetUrl).then(c => (c && "focus" in c ? c.focus() : null));
          }
          client.focus();
          client.postMessage({
            type: "PUSH_NOTIFICATION_CLICKED",
            data: notifData,
            targetUrl: targetUrl
          });
          return;
        }
      }

      // 2. Si no hay ventana abierta, abrir una nueva ventana con la URL canónica de la app
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
