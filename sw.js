'use strict';
// Change the version whenever any shipped asset changes.
const CACHE='hitotsu-v1:'+self.registration.scope+':1.2.4:9e5e958e8120';
const PREFIX='hitotsu-v1:'+self.registration.scope+':';
const ASSETS=['./','./index.html','./firebase-sdk.js','./about.html','./privacy.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(event.request.mode==='navigate'){
      const relativePath=url.pathname.slice(new URL(self.registration.scope).pathname.length);
      const page=relativePath===''?'./index.html':'./'+relativePath;
      return (await cache.match(page))||fetch(event.request);
    }
    return (await cache.match(event.request,{ignoreSearch:true}))||fetch(event.request);
  })());
});
