import { USER_NAME } from './kinds'

export const FOCUS_MS = 25 * 60 * 1000
export const BREAK_MS = 5 * 60 * 1000
export const FOCUS_OPTIONS = [
  { label: '10 min', ms: 10 * 60 * 1000 },
  { label: '25 min', ms: 25 * 60 * 1000 },
  { label: '50 min', ms: 50 * 60 * 1000 },
]

export function formatMs(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return `Bom dia, ${USER_NAME}`
  if (hour < 18) return `Boa tarde, ${USER_NAME}`
  return `Boa noite, ${USER_NAME}`
}

export function startOfDay() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function formatWhen(ms) {
  const date = new Date(ms)
  const now = new Date()
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const today = now.toDateString()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today) return `hoje, ${time}`
  if (date.toDateString() === tomorrow.toDateString()) return `amanhã, ${time}`
  return date.toLocaleString('pt-BR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function reminderPresets() {
  const now = Date.now()

  function atHours(hours, minutes) {
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    if (date.getTime() <= now) date.setDate(date.getDate() + 1)
    return date.getTime()
  }

  const evening = atHours(20, 0)
  const morning = atHours(8, 0)

  return [
    { id: '5', label: '5 min', at: now + 5 * 60 * 1000 },
    { id: '15', label: '15 min', at: now + 15 * 60 * 1000 },
    { id: '60', label: '1 hora', at: now + 60 * 60 * 1000 },
    { id: '180', label: '3 horas', at: now + 3 * 60 * 60 * 1000 },
    {
      id: 'night',
      label: new Date(evening).getDate() === new Date().getDate() ? 'Hoje 20h' : 'Amanhã 20h',
      at: evening,
    },
    {
      id: 'morning',
      label: new Date(morning).getDate() === new Date().getDate() ? 'Hoje 8h' : 'Amanhã 8h',
      at: morning,
    },
  ]
}

export function atFromTime(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  if (date.getTime() <= Date.now() + 15_000) {
    date.setDate(date.getDate() + 1)
  }
  return date.getTime()
}

export function isIos() {
  const ua = navigator.userAgent || ''
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
