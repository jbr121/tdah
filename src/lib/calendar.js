function stamp(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function buildEvent({ title, at, daily = false }) {
  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@agora.app`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agora//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(at)}`,
    `DTEND:${stamp(at + 5 * 60 * 1000)}`,
    `SUMMARY:${escapeText(title)}`,
    'DESCRIPTION:Lembrete do Agora',
  ]

  if (daily) lines.push('RRULE:FREQ=DAILY')

  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT0S',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  )

  return lines.join('\r\n')
}

export function openCalendarAlarm(options) {
  const ics = buildEvent(options)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = options.daily ? 'agora-diario.ics' : 'agora-lembrete.ics'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2500)
}
