// Service worker : met toute l'application en cache pour un fonctionnement 100 % hors ligne.
// Pense à changer VERSION à chaque mise à jour du contenu.
const VERSION = 'gidro-v1.2.0';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/app.css',
  './js/app.js', './js/store.js', './js/engine.js', './js/i18n.js', './js/audio.js', './js/mascot.js',
  './data/courses.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Voix naturelles : on télécharge tous les fichiers audio une fois pour l'usage hors ligne
let audioJob = null;
async function cacheAudio() {
  try {
    const res = await fetch('./audio/index.json', { cache: 'no-cache' });
    if (!res.ok) return;
    const cache = await caches.open(VERSION);
    await cache.put('./audio/index.json', res.clone());
    const idx = await res.json();
    const urls = [];
    for (const [cid, v] of Object.entries(idx)) for (const h of new Set(Object.values(v.files))) urls.push(`./audio/${cid}/${h}.mp3`);
    for (let i = 0; i < urls.length; i += 16) {
      await Promise.all(urls.slice(i, i + 16).map(async u => {
        if (await cache.match(u)) return;
        try { const r = await fetch(u); if (r.ok) await cache.put(u, r); } catch {}
      }));
    }
  } catch {}
}
self.addEventListener('message', e => {
  if (e.data === 'cache-audio') { audioJob = audioJob || cacheAudio().finally(() => { audioJob = null; }); e.waitUntil(audioJob); }
});

// Cache d'abord, puis réseau (et mise à jour du cache en arrière-plan)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || net;
    })
  );
});
