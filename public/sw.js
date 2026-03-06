const CACHE_NAME = 'ww-cache-v1'
const IMAGE_CACHE_NAME = 'ww-images-v1'
const IMAGE_CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days
const IMAGE_CACHE_MAX_ENTRIES = 200

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

function isFirebaseStorageImage(url) {
  return url.includes('firebasestorage.googleapis.com')
}

function isStaticAsset(url) {
  return url.includes('/_next/static/')
}

async function cacheFirstWithExpiry(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    const cachedTime = cached.headers.get('sw-cache-time')
    if (cachedTime && (Date.now() - parseInt(cachedTime)) < maxAge) {
      return cached
    }
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const headers = new Headers(response.headers)
      headers.set('sw-cache-time', Date.now().toString())
      const cachedResponse = new Response(await response.blob(), {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
      await cache.put(request, cachedResponse)

      // Evict old entries if over limit
      const keys = await cache.keys()
      if (keys.length > IMAGE_CACHE_MAX_ENTRIES) {
        await cache.delete(keys[0])
      }
    }
    return response
  } catch (err) {
    if (cached) return cached
    throw err
  }
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

  // Firebase Storage images: cache first (30 days)
  if (isFirebaseStorageImage(url)) {
    event.respondWith(cacheFirstWithExpiry(event.request, IMAGE_CACHE_NAME, IMAGE_CACHE_MAX_AGE))
    return
  }

  // Static assets: cache first (immutable by hash)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // Navigation and other requests: network first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request))
    return
  }

  // Default: network passthrough
  event.respondWith(fetch(event.request))
})
