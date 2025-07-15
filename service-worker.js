const CACHE_NAME = "acet-timetable-v1";
const urlsToCache = [
  "/ACET_IT_7thsem_Time-Table/",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "/ACET_IT_7thsem_Time-Table/icon-192.png",
  "/ACET_IT_7thsem_Time-Table/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});
