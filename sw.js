const CACHE_NAME = 'arabus-pro-cache-v1';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './base.js',
    './manifest.json'
];

// Установка кэша при первом заходе
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(URLS_TO_CACHE))
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    // Игнорируем запросы к облаку Firebase (они работают через свой механизм)
    if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('google')) return;

    // Стратегия: "Сначала кэш, потом сеть" (Stale-While-Revalidate)
    // Это значит, что база 8.5 МБ откроется за 0 секунд из памяти телефона!
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            }).catch(() => {
                console.log("Офлайн режим: загружено из памяти");
            });

            return cachedResponse || fetchPromise;
        })
    );
});


