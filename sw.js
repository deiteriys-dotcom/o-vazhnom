'use strict';
const CACHE = 'o-vazhnom-v4';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(asset => new Request(asset,{cache:'reload'})))).then(() => self.skipWaiting())));
self.addEventListener('activate',event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('o-vazhnom-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch',event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const cached = caches.match(event.request).then(response => response || (event.request.mode === 'navigate' ? caches.match('./index.html') : undefined)).catch(() => undefined);
  const refresh = cached.then(async fallback => {
    try {
      const response = await fetch(event.request);
      if (response.ok && !response.redirected) await caches.open(CACHE).then(cache => cache.put(event.request,response.clone())).catch(() => {});
      return response.ok ? response : fallback || response;
    } catch { return fallback || Response.error(); }
  });
  event.waitUntil(refresh.then(() => {}));
  event.respondWith(cached.then(response => response || refresh));
});
