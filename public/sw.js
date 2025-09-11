const CACHE_NAME = 'daggerheart-gm-v1.0.0'
const STATIC_CACHE_URLS = [
  '/Daggerheart/',
  '/Daggerheart/index.html',
  '/Daggerheart/assets/index.css',
  '/Daggerheart/assets/index.js',
  '/Daggerheart/assets/lucide.js',
  '/Daggerheart/assets/fa.js',
  '/Daggerheart/assets/dndkit.js',
  '/Daggerheart/assets/Creator.js',
  '/Daggerheart/assets/Browser.js',
  '/Daggerheart/assets/environments.js'
]

const DATA_CACHE_URLS = [
  '/Daggerheart/data/adversaries.json',
  '/Daggerheart/data/environments.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url)
          return cachedResponse
        }

        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network', event.request.url)
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response for caching
            const responseToCache = response.clone()

            // Cache data files and static assets
            if (DATA_CACHE_URLS.some(url => event.request.url.includes(url)) ||
                STATIC_CACHE_URLS.some(url => event.request.url.includes(url))) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache)
                })
            }

            return response
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error)
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/Daggerheart/index.html')
            }
            
            throw error
          })
      })
  )
})

// Handle offline/online status
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
