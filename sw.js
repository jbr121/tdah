const CACHE_NAME = 'agora-v7'
const BASE = new URL('./', self.location).pathname

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([BASE, `${BASE}index.html`, `${BASE}manifest.json`])
    )
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.pathname.endsWith('/sw.js')) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(BASE)))
  )
})

self.addEventListener('push', (event) => {
  let data = { title: 'Malu', body: 'Hora de olhar pra isso.' }
  try {
    const parsed = event.data?.json()
    if (parsed && typeof parsed === 'object') data = { ...data, ...parsed }
  } catch {
    const text = event.data?.text()
    if (text) data.body = text
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Malu', {
      body: data.body || 'Hora de olhar pra isso.',
      icon: `${BASE}icon-192.png`,
      badge: `${BASE}icon-192.png`,
      tag: data.tag || 'malu',
      renotify: true,
      data: { url: BASE },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const open = clients.find((client) => 'focus' in client)
      if (open) return open.focus()
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data?.url || BASE)
      }
      return undefined
    })
  )
})
