const OFFLINE_URL = "/offline";
const CACHE_NAME = "jivara-offline-v2";
const OFFLINE_ASSETS = [OFFLINE_URL, "/images/logo/text.png", "/images/logo/splash.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all(
      OFFLINE_ASSETS.map((asset) => cache.add(new Request(asset, { cache: "reload" }))),
    )),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL).then((response) => response ?? Response.error())),
    );
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
