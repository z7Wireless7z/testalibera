// TestaLibera: fa funzionare l'app anche senza internet
const CACHE="testalibera-v38";
const FILES=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./sc-dafare.png","./sc-appunto.png","./sc-svuota.png","./sc-spesa.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const url=new URL(r.url);
  // la pagina: prima provo internet (cosi' ricevi gli aggiornamenti), se non c'e' uso la copia salvata
  if(r.mode==="navigate"){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return res;})
      .catch(()=>caches.match("./index.html")));
    return;
  }
  // tutto il resto (icone, caratteri): uso la copia salvata, e la aggiorno quando posso
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>hit);
    return hit||net;
  }));
});
