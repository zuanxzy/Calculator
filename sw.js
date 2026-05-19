const CACHE_NAME = 'sigma-calc-v2'; // Tukar ke v2 sebab kita ubah struktur assets
const ASSETS = [
  './', // Cukup letak root sahaja untuk GitHub Pages
  './style.css',
  './script.js',
  './manifest.json'
];

// Install Event - Simpan assets dalam cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Sigma SW] Pre-caching assets');
        return cache.addAll(ASSETS);
      })
      .catch(err => console.error('[Sigma SW] Cache addAll failed:', err))
  );
  self.skipWaiting();
});

// Activate Event - Padam cache lama (v1) bersandarkan nama CACHE_NAME
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Sigma SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch Event - Taktik: Stale-While-Revalidate (Laju + Auto Update belakang tab)
self.addEventListener('fetch', (e) => {
  // Hanya intercept request GET biasa (elakkan sangkut kalau ada API/Extension)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        // Sentiasa fetch dari network dalam masa yang sama untuk update cache
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          // Kalau dapat response cun, simpan salinan terbaru dalam cache
          if (networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Kalau offline gila-gila, fetchPromise ni fail, tapi kita tak kisah sebab ada cachedResponse
        });

        // Pulangkan cached response terus kalau ada (INSTANT!), kalau takda baru tunggu network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
