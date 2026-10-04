// Service worker de Minigames Retro: permite jugar sin conexión.
// Estrategia: primero la red (así los cambios que subas se ven enseguida) y, si no hay conexión, la copia guardada.
const V = 'minigames-retro-v2';
const CORE = ['./', './index.html', './estrato.html', './hervor.html', './ovni-slot.html', './manifest.webmanifest',
  './icons/pad-32.png', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res && res.ok) { const copia = res.clone(); caches.open(V).then(c => c.put(r, copia)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
