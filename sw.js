const CACHE_NAME = 'arabus-pro-cache-v3';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './base.js',
    './manifest.json',
    './tts-native.js'
];

// Установка кэша при первом заходе
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(URLS_TO_CACHE))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    // Игнорируем запросы к облаку Firebase (они работают через свой механизм)
    if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('google')) return;

    // Для index.html используем "сначала сеть, потом кэш", чтобы быстрее получать свежие фиксы.
    if (event.request.mode === 'navigate' || event.request.url.endsWith('/index.html')) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
                    return networkResponse;
                })
                .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
        );
        return;
    }

    // Для остального: "Сначала кэш, потом сеть" (Stale-While-Revalidate)
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
