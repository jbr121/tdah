let audioCtx = null

function context() {
  const Audio = window.AudioContext || window.webkitAudioContext
  if (!Audio) return null
  if (!audioCtx) audioCtx = new Audio()
  return audioCtx
}

export function unlockAlarm() {
  const ctx = context()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

function tone(ctx, frequency, start, duration, peak = 0.07) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export function playChime() {
  const ctx = context()
  if (!ctx) return
  unlockAlarm()
  const now = ctx.currentTime
  tone(ctx, 523.25, now, 0.42, 0.07)
  tone(ctx, 659.25, now + 0.2, 0.55, 0.06)
}

export function playTap() {
  const ctx = context()
  if (!ctx) return
  unlockAlarm()
  tone(ctx, 440, ctx.currentTime, 0.18, 0.04)
}
