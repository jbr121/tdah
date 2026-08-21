export const PUSH_API = 'https://agora-malu.lapis-mammal.workers.dev'
export const VAPID_PUBLIC_KEY =
  'BOLZdKRtQ03KiIly7DpfDoYHN9OPxWrRsdxXSg95KYACT4kvhk62XIiq4iizszTODPhvs7nz4NY4fC8eWDBEiN8'

export function isStandalone() {
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

function vapidBytes() {
  const padding = '='.repeat((4 - (VAPID_PUBLIC_KEY.length % 4)) % 4)
  const base64 = (VAPID_PUBLIC_KEY + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

export async function enablePush() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'denied' }

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidBytes(),
    })
  }

  const response = await fetch(`${PUSH_API}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })

  if (!response.ok) return { ok: false, reason: 'server' }
  localStorage.setItem('agora.push.enabled', '1')
  return { ok: true, subscription }
}

export async function scheduleRemoteReminder(task, remindAt, subscription) {
  let sub = subscription
  if (!sub) {
    const enabled = await enablePush()
    if (!enabled.ok) return enabled
    sub = enabled.subscription
  }

  const response = await fetch(`${PUSH_API}/reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: task.id,
      text: task.text,
      remindAt,
      subscription: sub,
    }),
  })

  return { ok: response.ok }
}

export async function cancelRemoteReminder(id) {
  try {
    await fetch(`${PUSH_API}/reminder`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  } catch {
    // ignore
  }
}

export async function sendTestPush() {
  const enabled = await enablePush()
  if (!enabled.ok) return enabled
  const response = await fetch(`${PUSH_API}/test`, { method: 'POST' })
  return { ok: response.ok }
}
