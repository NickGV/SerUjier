const CACHE_NAME = "serujier-v1.0.0";
const RUNTIME_CACHE = "serujier-runtime";
const IMAGE_CACHE = "serujier-images";

// Recursos críticos para cache
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/placeholder-logo.png",
  "/placeholder-logo.svg",
];

// Instalar Service Worker y cachear recursos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activar y limpiar caches antiguos
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estrategias de cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no son HTTP/HTTPS
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Ignorar Firebase y APIs externas en cache
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.pathname.startsWith("/api/")
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        if (request.destination === "document") {
          return caches.match("/offline.html");
        }
      })
    );
    return;
  }

  // Estrategia para imágenes: Cache First
  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          return (
            response ||
            fetch(request).then((fetchResponse) => {
              cache.put(request, fetchResponse.clone());
              return fetchResponse;
            })
          );
        });
      })
    );
    return;
  }

  // Estrategia para navegación: Network First con fallback offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match("/offline.html");
          });
        })
    );
    return;
  }

  // Estrategia general: Cache First, fallback Network
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        // Actualizar cache en background
        fetch(request).then((fetchResponse) => {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, fetchResponse);
          });
        });
        return response;
      }

      return fetch(request).then((fetchResponse) => {
        return caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

// Sincronización en background
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implementar lógica de sincronización aquí
  console.log("Background sync triggered");
}

// Notificaciones push
self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/placeholder-logo.png",
    badge: "/placeholder-logo.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Click en notificaciones
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
