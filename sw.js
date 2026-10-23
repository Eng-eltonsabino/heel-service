/* Heel Service Gestão — lets the site install as an app and open without network (the data still needs Internet). */
const CACHE = 'heel-v2';
const BASE = ['./', 'index.html', 'admin.html', 'supabase.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'emblema-digital.png', 'logo-branco.png', 'logo-cinza.png', 'assinatura.png', 'marca-agua.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // Supabase, CDNs and fonts go straight to the network
  /* the page itself: always the newest version when online, the saved one when offline */
  if (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/')) {
    e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(CACHE).then((x) => x.put(r, c)); return res; }).catch(() => caches.match(r).then((h) => h || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(r, c)); } return res; })));
});
