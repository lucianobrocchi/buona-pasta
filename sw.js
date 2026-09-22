/* =====================================================================
   BUONA PASTA · service worker
   Guarda el "esqueleto" del sitio para que abra rápido en visitas
   repetidas y siga funcionando (con lo ya visitado) aunque falle la señal.
   Se actualiza solo: al cambiar VERSION, borra el cache viejo.
   ===================================================================== */
const VERSION = 'buona-pasta-v1';
const SHELL = [
  './',
  './index.html',
  './assets/css/styles.css',
  './assets/js/data.js',
  './assets/js/app.js',
  './assets/js/fx.js',
  './assets/fonts/fraunces.woff2',
  './assets/fonts/fraunces-italic.woff2',
  './assets/fonts/dmsans.woff2',
  './assets/img/hero-poster.webp',
  './favicon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).catch(() => { /* si algo falla, el resto se cachea al vuelo */ })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  // Páginas (HTML): primero la red, para no quedar con una versión vieja;
  // si no hay conexión, usamos lo último guardado.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { caches.open(VERSION).then((c) => c.put(req, res.clone())); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // El resto de los archivos propios (CSS, JS, fuentes, imágenes, video):
  // se sirven del cache al toque y se actualizan en segundo plano.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetching = fetch(req)
        .then((res) => { if (res && res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone())); return res; })
        .catch(() => cached);
      return cached || fetching;
    })
  );
});
