// Celestial Atlas service worker — cache-first for the fully static app,
// so it works offline and installs as a PWA.
const CACHE = 'celestial-atlas-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/main.js',
  './js/astro.js',
  './js/scene.js',
  './js/textures.js',
  './js/data/constellations.js',
  './js/data/meanings.js',
  './vendor/three.module.js',
  './vendor/OrbitControls.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(event.request).then((resp) => {
        // Cache same-origin responses on the fly (future assets, if any).
        if (resp.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return resp;
      }).catch(() => {
        // Offline navigation fallback → the app shell.
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    }),
  );
});
