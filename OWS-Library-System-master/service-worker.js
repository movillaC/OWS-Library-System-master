const CACHE = "ows-v1";
const STATIC = [
  "/",
  "/css/main.css",
  "/css/login.css",
  "/js/login.js",
  "/assets/logo_192 (2).png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (
    e.request.destination === "document" ||
    url.includes("/css/") ||
    url.includes("/js/") ||
    url.includes("/assets/")
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
  }
}); 