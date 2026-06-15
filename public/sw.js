const CACHE_NAME = "genzbio-v1";
const ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico"
];

// Install Event
self.addEventListener("install", (e) => {
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
    })
  );
});

// Fetch Event (Cache First / Fallback Network)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        // Return cached index if network fail (PWA Single Page App helper)
        if (e.request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});
