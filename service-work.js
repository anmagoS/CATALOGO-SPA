self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('anmago-cache').then(cache => {
     return cache.addAll([
  './INICIO.HTML',
  './ESTILO.CSS',
  './carrito.js',
  './logo.jpg',
  './logo.jpg'
]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});