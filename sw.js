// Guarda todos los archivos de la app en el dispositivo para que funcione sin internet.
const CACHE = 'pokedex-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'pokedex.json',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png',
  ...[1,2,3,4,5,6,7,8,9].map(g => `sprites-${g}.json`)];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    if (hit) return hit;
    return fetch(e.request).then(res => {
      // las fuentes de Google se guardan la primera vez que se descargan
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html'));
  }));
});
