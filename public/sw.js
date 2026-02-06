/// <reference lib="webworker" />

/**
 * SubSnooze Service Worker
 * Cache strategy: Network-first for pages, Cache-first for static assets
 */

const CACHE_VERSION = "subsnooze-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;

// Static assets to precache on install
const PRECACHE_ASSETS = [
  "/offline.html",
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("subsnooze-") && key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: different strategies per resource type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external origins
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip API routes and Supabase calls
  if (url.pathname.startsWith("/api/")) return;

  // Static assets (JS, CSS, images, fonts): cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Pages (HTML navigation): network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
});

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|eot)$/.test(pathname) ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/_next/static/");
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return dedicated offline page
    const offlinePage = await caches.match("/offline.html");
    if (offlinePage) return offlinePage;

    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }
}
