// Service worker de Minigames Retro: permite jugar sin conexión.
// Estrategia: primero la red (así los cambios que subas se ven enseguida) y, si no hay conexión, la copia guardada.
const V = 'minigames-retro-v53';
const CORE = ['./', './index.html', './estrato.html', './hervor.html', './ovni-slot.html', './security-system.html', './albanil.html', './runner.html', './farm.html', './desconexion.html', './ajustes-pad.html', './imperio-de-ogros.html', './garabatos.html', './build-of-war.html', './dados-en-linea.html', './street-taxi-go.html', './planta-ensacadora.html', './humanity.html', './lucha.html', './dados3d.html', './lucha/kheil.png', './lucha/boxer.png', './lucha/ninja.png', './lucha/sheflay.png', './lucha/greengor.png', './lucha/flashman.png', './lucha/rocketstar.png', './coins.js', './pad-skin.png', './manifest.webmanifest',
  './icons/pad-32.png', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  // cada archivo se guarda por separado: si alguno todavía no está subido, el resto igual se instala
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    // 'no-store' evita que el navegador entregue una copia vieja (GitHub Pages guarda los archivos ~10 minutos)
    fetch(r.mode === 'navigate' ? new Request(r.url, { cache: 'no-store', credentials: 'same-origin', redirect: 'manual' }) : new Request(r, { cache: 'no-store' })).then(res => {
      if (res && res.ok) { const copia = res.clone(); caches.open(V).then(c => c.put(r, copia)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
