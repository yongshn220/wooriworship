const CACHE_NAME = 'ww-cache-v2'

// --- Lifecycle ---

self.addEventListener('install', function (event) {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME })
          .map(function (name) { return caches.delete(name) })
      )
    }).then(function () {
      return self.clients.claim()
    })
  )
})

// --- Push Notifications ---

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow('https://www.wooriworship.com' + url))
})

// --- Caching Strategies ---

function isStaticAsset(url) {
  return url.includes('/_next/static/')
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    if (cached) return cached
    throw err
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    const cached = await caches.open(CACHE_NAME).then(c => c.match(request))
    if (cached) return cached
    throw err
  }
}

self.addEventListener('fetch', function (event) {
  const url = event.request.url

  // Static assets: cache first (immutable by hash)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // Navigation requests: network first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request))
    return
  }
})
