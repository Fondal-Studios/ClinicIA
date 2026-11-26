// Service worker. Guarda solo contenido público y estático: el aviso sin conexión y el código de Mi consultorio (para que abra sin internet).
// Nunca guarda respuestas de /api ni datos de pacientes: esos viven en el almacenamiento local del navegador.
const CACHE='clinicia-offline-v2';
const MODULE=['/consultorio.html','/consultorio.mjs','/consultorio-lib.mjs','/consultorio-whisper.mjs','/consultorio.webmanifest','/style.css','/areas.mjs','/assets/icon-192.png','/assets/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/offline.html',...MODULE])).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('clinicia-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 // Mi consultorio: con internet se usa la versión nueva y se actualiza la copia; sin internet, la copia guardada.
 if(MODULE.includes(url.pathname)){event.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(url.pathname,copy));}return r;}).catch(()=>caches.match(url.pathname)));return;}
 if(req.mode==='navigate')event.respondWith(fetch(req).catch(()=>caches.match('/offline.html')));
});
