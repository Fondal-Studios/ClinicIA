// Cache only a public offline notice. Never cache authenticated responses or clinical content.
const CACHE='clinicia-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/offline.html'])));self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('clinicia-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate'&&new URL(event.request.url).origin===self.location.origin)event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));});
