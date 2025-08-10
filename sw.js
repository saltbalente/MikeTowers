// Service Worker for Spiritual Services Landing Page
// Optimized for Core Web Vitals and Performance

const CACHE_NAME = 'spiritual-services-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// Critical resources to preload
const CRITICAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mystical%20spiritual%20candles%20crystals%20love%20ritual%20purple%20golden%20background%20realistic%20photography&image_size=landscape_16_9'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            }),
            // Cache critical resources
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('Service Worker: Caching critical resources');
                return cache.addAll(CRITICAL_RESOURCES.filter(url => {
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                }));
            })
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== IMAGE_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else if (isAPIRequest(request)) {
        event.respondWith(handleAPIRequest(request));
    } else {
        event.respondWith(handleNavigationRequest(request));
    }
});

// Check if request is for static assets
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/) ||
           STATIC_FILES.includes(url.pathname);
}

// Check if request is for images
function isImageRequest(request) {
    return request.destination === 'image' ||
           request.url.includes('text_to_image') ||
           request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Check if request is for API
function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') ||
           url.hostname.includes('api') ||
           url.hostname.includes('wa.me');
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Static asset fetch failed:', error);
        return new Response('Asset not available', { status: 503 });
    }
}

// Handle images with cache-first strategy and optimization
async function handleImageRequest(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(IMAGE_CACHE);
            // Only cache successful image responses
            if (networkResponse.headers.get('content-type')?.startsWith('image/')) {
                cache.put(request, networkResponse.clone());
            }
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Image fetch failed:', error);
        // Return a placeholder or fallback image
        return new Response('', { status: 503 });
    }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
    try {
        // Always try network first for API requests
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful API responses for short time
            const cache = await caches.open(DYNAMIC_CACHE);
            const responseToCache = networkResponse.clone();
            
            // Add timestamp for cache expiration
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cached-at', Date.now().toString());
            
            const modifiedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
            });
            
            cache.put(request, modifiedResponse);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: API fetch failed:', error);
        
        // Try to serve from cache as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Check if cached response is not too old (5 minutes)
            const cachedAt = cachedResponse.headers.get('sw-cached-at');
            if (cachedAt && (Date.now() - parseInt(cachedAt)) < 300000) {
                return cachedResponse;
            }
        }
        
        return new Response('API not available', { status: 503 });
    }
}

// Handle navigation requests with cache-first strategy
async function handleNavigationRequest(request) {
    try {
        // Try cache first for navigation
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Fetch in background to update cache
            fetch(request).then(response => {
                if (response.ok) {
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, response);
                    });
                }
            }).catch(() => {});
            
            return cachedResponse;
        }
        
        // If not in cache, fetch from network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Navigation fetch failed:', error);
        
        // Try to serve index.html as fallback for SPA
        const fallbackResponse = await caches.match('/index.html');
        if (fallbackResponse) {
            return fallbackResponse;
        }
        
        return new Response('Page not available offline', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'whatsapp-form-sync') {
        event.waitUntil(syncWhatsAppForms());
    }
});

// Sync WhatsApp form submissions when online
async function syncWhatsAppForms() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        for (const request of requests) {
            if (request.url.includes('whatsapp-form-data')) {
                try {
                    const response = await cache.match(request);
                    const formData = await response.json();
                    
                    // Process the form data (send to WhatsApp or analytics)
                    console.log('Syncing form data:', formData);
                    
                    // Remove from cache after successful sync
                    await cache.delete(request);
                } catch (error) {
                    console.error('Failed to sync form data:', error);
                }
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'Nueva consulta espiritual disponible',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'spiritual-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Ver consulta'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Servicios Espirituales', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_WHATSAPP_DATA') {
        cacheWhatsAppData(event.data.payload);
    }
});

// Cache WhatsApp form data for offline submission
async function cacheWhatsAppData(data) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const request = new Request(`/whatsapp-form-data-${Date.now()}`);
        const response = new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
        
        await cache.put(request, response);
        console.log('WhatsApp data cached for offline submission');
    } catch (error) {
        console.error('Failed to cache WhatsApp data:', error);
    }
}

// Periodic cache cleanup
setInterval(async () => {
    try {
        const cacheNames = await caches.keys();
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                const cachedAt = response.headers.get('sw-cached-at');
                
                // Remove entries older than 24 hours
                if (cachedAt && (Date.now() - parseInt(cachedAt)) > 86400000) {
                    await cache.delete(request);
                }
            }
        }
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}, 3600000); // Run every hour

console.log('Service Worker: Script loaded successfully');