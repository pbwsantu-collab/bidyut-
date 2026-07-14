// =============================================
// 📚 BIDYUT - Service Worker
// Offline Support & Caching Strategy
// Version: 1.0.0
// =============================================

// ===== CONFIGURATION =====
const CACHE_NAME = 'bidyut-v1';
const OFFLINE_URL = 'index.html';

// ===== FILES TO CACHE =====
const ASSETS = [
    '/bidyut-/',
    '/bidyut-/index.html',
    '/bidyut-/library.html',
    '/bidyut-/videos.html',
    '/bidyut-/contact.html',
    '/bidyut-/style.css',
    '/bidyut-/script.js',
    '/bidyut-/manifest.json',
    // Add your PDF files here when ready
    // '/bidyut-/pdfs/maths_class5_ch1.pdf',
];

// =============================================
// 1. INSTALL EVENT - Cache all assets
// =============================================
self.addEventListener('install', (event) => {
    console.log('📚 Bidyut: Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📚 Bidyut: Caching assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => {
                console.log('📚 Bidyut: Installation complete!');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('📚 Bidyut: Installation failed:', error);
            })
    );
});

// =============================================
// 2. ACTIVATE EVENT - Clean up old caches
// =============================================
self.addEventListener('activate', (event) => {
    console.log('📚 Bidyut: Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('📚 Bidyut: Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('📚 Bidyut: Activation complete!');
                return self.clients.claim();
            })
    );
});

// =============================================
// 3. FETCH EVENT - Serve from cache or network
// =============================================
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    // Skip requests to other domains
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) {
        // Allow YouTube and other external resources
        if (url.hostname.includes('youtube.com') || 
            url.hostname.includes('ytimg.com') ||
            url.hostname.includes('google.com')) {
            event.respondWith(fetch(event.request));
        }
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    // Fetch fresh version in background
                    fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, networkResponse);
                                    });
                            }
                        })
                        .catch(() => {});
                    
                    return cachedResponse;
                }

                // If not in cache, fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Cache the response for future use
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('📚 Bidyut: Fetch failed:', error);
                        
                        // Return offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        return new Response('Offline - Please check your connection.', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// =============================================
// 4. MESSAGE EVENT - Handle messages from pages
// =============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// =============================================
// 5. PUSH EVENT - Handle push notifications (future)
// =============================================
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: 'icons/icon-192x192.png',
        badge: 'icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/bidyut-/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('📚 Bidyut', options)
    );
});

// =============================================
// 6. NOTIFICATION CLICK - Handle notification clicks
// =============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

console.log('📚 Bidyut: Service Worker loaded successfully!');
