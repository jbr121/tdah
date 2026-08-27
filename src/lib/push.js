export const PUSH_API = 'https://agora-malu.loud-fibula.workers.dev'
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

function toJSON(subscription) {
  return typeof subscription?.toJSON === 'function' ? subscription.toJSON() : subscription
}

export async function enablePush() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' }
  }

  if (!isStandalone() && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return { ok: false, reason: 'homescreen' }
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

  try {
    const response = await fetch(`${PUSH_API}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toJSON(subscription)),
    })
    if (!response.ok) return { ok: false, reason: 'server', subscription: toJSON(subscription) }
  } catch {
    return { ok: false, reason: 'server' }
  }

  localStorage.setItem('agora.push.enabled', '1')
  return { ok: true, subscription: toJSON(subscription) }
}

export async function scheduleRemoteReminder(task, remindAt, subscription) {
  let sub = subscription
  if (!sub) {
    const enabled = await enablePush()
    if (!enabled.ok && !enabled.subscription) return enabled
    sub = enabled.subscription
  }

  try {
    const response = await fetch(`${PUSH_API}/reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: task.id,
        text: task.text,
        remindAt,
        subscription: toJSON(sub),
      }),
    })
    if (!response.ok) return { ok: false, reason: 'server' }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'server' }
  }
}

export async function cancelRemoteReminder() {
  // The delayed worker hop cannot be cancelled reliably; ignore.
}

export async function sendTestPush() {
  const enabled = await enablePush()
  if (!enabled.ok && !enabled.subscription) return enabled

  try {
    const response = await fetch(`${PUSH_API}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: toJSON(enabled.subscription),
        text: 'Aviso de teste. Se você viu isto, os avisos estão ligados.',
      }),
    })
    const payload = await response.json().catch(() => ({}))
    if (response.ok && payload.ok) return { ok: true }
    return { ok: false, reason: 'server' }
  } catch {
    return { ok: false, reason: 'server' }
  }
}

export function explainPushError(reason) {
  if (reason === 'homescreen') {
    return 'No iPhone, abra pelo ícone da Tela de Início (não pela aba do Safari).'
  }
  if (reason === 'denied') {
    return 'O iPhone bloqueou. Ajustes → Malu → Avisos → Permitir.'
  }
  if (reason === 'unsupported') {
    return 'Este iPhone precisa do iOS 16.4 ou mais novo.'
  }
  if (reason === 'server') {
    return 'O servidor de avisos está fora. Tenta de novo em um minuto.'
  }
  return 'Não consegui ligar os avisos.'
}
