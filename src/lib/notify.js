export async function ensureNotifyPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export async function notify({ title, body, tag = 'agora' }) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const options = {
    body,
    tag,
    icon: `${import.meta.env.BASE_URL}icon-192.png`,
    badge: `${import.meta.env.BASE_URL}icon-192.png`,
    lang: 'pt-BR',
    silent: false,
  }

  try {
    const registration = await navigator.serviceWorker?.ready
    if (registration?.showNotification) {
      await registration.showNotification(title, options)
      return
    }
  } catch {
    // fall through to page notification
  }

  try {
    new Notification(title, options)
  } catch {
    // iOS Safari may reject page notifications outside a PWA
  }
}
