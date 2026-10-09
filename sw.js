const CACHE='bz-v2';
const SHELL=['./','./index.html','./xlsx.full.min.js','./manifest.webmanifest','./icon-192.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET') return;
  if(/(^|\.)(docs|script)\.google\.com$|googleusercontent\.com$/.test(url.hostname)) return;
  if(req.mode==='navigate'){
    if(!/\/(index\.html)?$/.test(url.pathname)) return;
    e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return r})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)||url.origin===location.origin){
    e.respondWith(caches.match(req).then(hit=>{
      const net=fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c))}return r}).catch(()=>hit);
      return hit||net;
    }));
  }
});
