// ============================================================================
// SerUjier Service Worker - PWA Avanzado
// ============================================================================

const VERSION = "2.0.0";
const CACHE_PREFIX = "serujier";
const CACHE_NAME = `${CACHE_PREFIX}-static-v${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v${VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-v${VERSION}`;
const FONT_CACHE = `${CACHE_PREFIX}-fonts-v${VERSION}`;
const API_CACHE = `${CACHE_PREFIX}-api-v${VERSION}`;

// Configuración de tiempos
const CACHE_EXPIRATION = {
  images: 30 * 24 * 60 * 60 * 1000, // 30 días
  fonts: 365 * 24 * 60 * 60 * 1000, // 1 año
  api: 5 * 60 * 1000, // 5 minutos
  runtime: 24 * 60 * 60 * 1000, // 24 horas
};

const MAX_CACHE_SIZE = {
  images: 50,
  runtime: 50,
  api: 30,
};

// Recursos críticos para precache
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
  "/icons/apple-touch-icon.png",
];

// URLs que se cachearán en runtime
const RUNTIME_CACHE_URLS = [
  "/conteo",
  "/simpatizantes",
  "/miembros",
  "/ujieres",
  "/visitas",
  "/historial",
  "/he-restauracion",
];

// Cola de sincronización para requests fallidos
let failedRequests = [];

// ============================================================================
// UTILIDADES
// ============================================================================

const log = (...args) => {
  if (self.location.hostname === "localhost") {
    console.log("[SW]", ...args);
  }
};

const logError = (...args) => {
  console.error("[SW Error]", ...args);
};

// Verificar si una URL es cacheable
const isCacheable = (request) => {
  const url = new URL(request.url);
  return (
    url.protocol.startsWith("http") &&
    request.method === "GET" &&
    !url.pathname.startsWith("/api/auth/") // No cachear autenticación
  );
};

// Verificar si el cache ha expirado
const isCacheExpired = (cachedResponse, maxAge) => {
  if (!cachedResponse) return true;
  const cachedDate = cachedResponse.headers.get("sw-cache-date");
  if (!cachedDate) return true;
  const age = Date.now() - new Date(cachedDate).getTime();
  return age > maxAge;
};

// Agregar metadata al response antes de cachear
const addCacheMetadata = (response) => {
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.set("sw-cache-date", new Date().toISOString());

  return clonedResponse.blob().then(blob => {
    return new Response(blob, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: headers
    });
  });
};

// Limpiar cache por tamaño máximo
const trimCache = async (cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    log(`Trimmed ${keysToDelete.length} items from ${cacheName}`);
  }
};

// Limpiar cache expirado
const cleanExpiredCache = async (cacheName, maxAge) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  for (const request of keys) {
    const response = await cache.match(request);
    if (isCacheExpired(response, maxAge)) {
      await cache.delete(request);
      log(`Removed expired cache for ${request.url}`);
    }
  }
};

// ============================================================================
// INSTALACIÓN
// ============================================================================

self.addEventListener("install", (event) => {
  log("Installing service worker version", VERSION);

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        log("Precaching static resources");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        log("Service worker installed successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        logError("Installation failed:", error);
        throw error;
      })
  );
});

// ============================================================================
// ACTIVACIÓN
// ============================================================================

self.addEventListener("activate", (event) => {
  log("Activating service worker version", VERSION);

  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith(CACHE_PREFIX) && !isCurrentCache(cacheName)) {
              log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control inmediatamente
      self.clients.claim(),
      // Limpiar caches expirados
      cleanExpiredCache(IMAGE_CACHE, CACHE_EXPIRATION.images),
      cleanExpiredCache(API_CACHE, CACHE_EXPIRATION.api),
    ])
    .then(() => {
      log("Service worker activated successfully");
      // Notificar a todos los clientes sobre la actualización
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "SW_ACTIVATED",
            version: VERSION,
          });
        });
      });
    })
    .catch((error) => {
      logError("Activation failed:", error);
    })
  );
});

const isCurrentCache = (cacheName) => {
  return [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, FONT_CACHE, API_CACHE].includes(cacheName);
};

// ============================================================================
// FETCH - ESTRATEGIAS DE CACHE
// ============================================================================

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests no HTTP/HTTPS o no GET
  if (!isCacheable(request)) {
    return;
  }

  // Estrategia para Firebase/Firestore - Network Only con retry
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebase")
  ) {
    event.respondWith(handleFirebaseRequest(request));
    return;
  }

  // Estrategia para APIs - Network First con cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Estrategia para imágenes - Cache First con stale-while-revalidate
  if (request.destination === "image") {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Estrategia para fuentes - Cache First (larga duración)
  if (request.destination === "font" || url.pathname.includes("/fonts/")) {
    event.respondWith(handleFontRequest(request));
    return;
  }

  // Estrategia para navegación - Network First con cache fallback completo
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Estrategia para assets estáticos - Stale While Revalidate
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    url.pathname.includes("/_next/")
  ) {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }

  // Estrategia por defecto - Network First
  event.respondWith(handleDefaultRequest(request));
});

// Firebase: Network Only con retry y queue
const handleFirebaseRequest = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      return response;
    }
    throw new Error(`Firebase request failed: ${response.status}`);
  } catch (error) {
    logError("Firebase request failed:", error);
    // Guardar en cola para sincronización posterior
    if (request.method === "POST" || request.method === "PUT") {
      queueFailedRequest(request);
    }
    throw error;
  }
};

// API: Network First con cache temporal
const handleApiRequest = async (request) => {
  const cache = await caches.open(API_CACHE);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = await addCacheMetadata(networkResponse);
      cache.put(request, responseToCache);
      trimCache(API_CACHE, MAX_CACHE_SIZE.api);
      return networkResponse;
    }
    throw new Error(`API request failed: ${networkResponse.status}`);
  } catch (error) {
    log("API network failed, trying cache:", request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_EXPIRATION.api)) {
      return cachedResponse;
    }
    throw error;
  }
};

// Imágenes: Cache First con stale-while-revalidate
const handleImageRequest = async (request) => {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const responseToCache = await addCacheMetadata(response);
        cache.put(request, responseToCache);
        trimCache(IMAGE_CACHE, MAX_CACHE_SIZE.images);
      }
      return response;
    })
    .catch((error) => {
      logError("Image fetch failed:", error);
      return null;
    });

  // Si hay cache, devolverlo inmediatamente y actualizar en background
  if (cachedResponse) {
    return cachedResponse;
  }

  // Si no hay cache, esperar la descarga
  return fetchPromise;
};

// Fuentes: Cache First (larga duración)
const handleFontRequest = async (request) => {
  const cache = await caches.open(FONT_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    logError("Font fetch failed:", error);
    throw error;
  }
};

// Navegación: Network First con offline fallback
const handleNavigationRequest = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = await addCacheMetadata(response);
      cache.put(request, responseToCache);
      trimCache(RUNTIME_CACHE, MAX_CACHE_SIZE.runtime);
    }
    return response;
  } catch (error) {
    log("Navigation network failed, trying cache:", request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback a offline.html
    return caches.match("/offline.html");
  }
};

// Assets estáticos: Stale While Revalidate
const handleStaticAssetRequest = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const responseToCache = await addCacheMetadata(response);
        cache.put(request, responseToCache);
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
};

// Request por defecto: Network First
const handleDefaultRequest = async (request) => {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

// ============================================================================
// SINCRONIZACIÓN EN BACKGROUND
// ============================================================================

const queueFailedRequest = (request) => {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    timestamp: Date.now(),
  };

  failedRequests.push(requestData);
  log("Request queued for sync:", requestData);
};

self.addEventListener("sync", (event) => {
  log("Background sync event:", event.tag);

  if (event.tag === "sync-failed-requests") {
    event.waitUntil(syncFailedRequests());
  }

  if (event.tag === "cleanup-cache") {
    event.waitUntil(cleanupAllCaches());
  }
});

const syncFailedRequests = async () => {
  log("Syncing failed requests:", failedRequests.length);

  const successfulSyncs = [];

  for (const requestData of failedRequests) {
    try {
      const request = new Request(requestData.url, {
        method: requestData.method,
        headers: new Headers(requestData.headers),
      });

      const response = await fetch(request);
      if (response.ok) {
        successfulSyncs.push(requestData);
        log("Successfully synced:", requestData.url);
      }
    } catch (error) {
      logError("Failed to sync:", requestData.url, error);
    }
  }

  // Remover requests sincronizados exitosamente
  failedRequests = failedRequests.filter(
    (req) => !successfulSyncs.includes(req)
  );

  // Notificar a clientes
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_COMPLETE",
      synced: successfulSyncs.length,
      pending: failedRequests.length,
    });
  });
};

const cleanupAllCaches = async () => {
  log("Running cache cleanup");
  await Promise.all([
    cleanExpiredCache(IMAGE_CACHE, CACHE_EXPIRATION.images),
    cleanExpiredCache(API_CACHE, CACHE_EXPIRATION.api),
    cleanExpiredCache(RUNTIME_CACHE, CACHE_EXPIRATION.runtime),
    trimCache(IMAGE_CACHE, MAX_CACHE_SIZE.images),
    trimCache(RUNTIME_CACHE, MAX_CACHE_SIZE.runtime),
    trimCache(API_CACHE, MAX_CACHE_SIZE.api),
  ]);
  log("Cache cleanup complete");
};

// ============================================================================
// NOTIFICACIONES PUSH
// ============================================================================

self.addEventListener("push", (event) => {
  log("Push notification received");

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || "Nueva notificación de SerUjier",
    icon: "/icons/android-chrome-192x192.png",
    badge: "/icons/favicon-32x32.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "serujier-notification",
    requireInteraction: false,
    actions: data.actions || [],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || Date.now(),
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "SerUjier",
      options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  log("Notification clicked:", event.action);
  event.notification.close();

  const urlToOpen = event.notification.data.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Buscar si ya hay una ventana abierta
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============================================================================
// MENSAJES DEL CLIENTE
// ============================================================================

self.addEventListener("message", (event) => {
  log("Message received:", event.data);

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith(CACHE_PREFIX)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }

  if (event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: VERSION });
  }
});

// ============================================================================
// LOGGING Y DEBUGGING
// ============================================================================

log(`Service Worker v${VERSION} loaded`);

// Periodic cleanup (cada 24 horas)
setInterval(() => {
  cleanupAllCaches();
}, 24 * 60 * 60 * 1000);
