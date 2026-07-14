const CACHE_NAME = "gemquest-pwa-v2";
const NETWORK_ONLY_PATHS = new Set(["/clerk-config.json", "/supabase-config.json"]);
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/app.js",
  "./src/auth.js",
  "./src/audio.js",
  "./src/board.js",
  "./src/gameData.js",
  "./src/gameFunctions.js",
  "./src/gameLogic.js",
  "./src/gameState.js",
  "./src/mastery.js",
  "./src/storage.js",
  "./src/views.js",
  "./src/styles.css",
  "./src/menu-art.png",
  "./src/716982__kickhat__gameplay-match-3.wav",
  "./assets/estrella_transparente.png",
  "./assets/fence_sprite.png",
  "./assets/pirata.png",
  "./assets/pirata_sprite.png",
  "./assets/tesoro_transparente.png",
  "./assets/gems/amber.png",
  "./assets/gems/black.png",
  "./assets/gems/blue.png",
  "./assets/gems/green.png",
  "./assets/gems/red.png",
  "./assets/gems/violet.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    return;
  }

  if (NETWORK_ONLY_PATHS.has(url.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached ?? caches.match("./index.html");
      })
  );
});
