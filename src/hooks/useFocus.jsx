import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BREAK_MS, FOCUS_MS } from '../lib/format'

const STORAGE_KEY = 'agora.focus.v1'
const FocusContext = createContext(null)

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && parsed.taskId ? parsed : null
  } catch {
    return null
  }
}

function remainingNow(session, now = Date.now()) {
  if (!session) return 0
  if (!session.running) return Math.max(0, session.remainingMs)
  return Math.max(0, session.remainingMs - (now - session.updatedAt))
}

export function FocusProvider({ children }) {
  const [session, setSession] = useState(loadSession)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  useEffect(() => {
    if (!session?.running) return undefined
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [session?.running])

  const remainingMs = remainingNow(session, now)
  const ended = Boolean(session) && remainingMs <= 0

  useEffect(() => {
    if (session?.running && remainingMs <= 0) {
      setSession((current) =>
        current
          ? { ...current, running: false, remainingMs: 0, updatedAt: Date.now() }
          : current
      )
    }
  }, [remainingMs, session?.running])

  const start = useCallback((taskId, durationMs = FOCUS_MS, kind = 'focus') => {
    setSession({
      taskId,
      durationMs,
      remainingMs: durationMs,
      running: true,
      kind,
      updatedAt: Date.now(),
      alarmFired: false,
      warned: false,
    })
    setNow(Date.now())
  }, [])

  const pause = useCallback(() => {
    setSession((current) => {
      if (!current) return current
      return {
        ...current,
        running: false,
        remainingMs: remainingNow(current),
        updatedAt: Date.now(),
      }
    })
  }, [])

  const resume = useCallback(() => {
    setSession((current) => {
      if (!current || remainingNow(current) <= 0) return current
      return {
        ...current,
        remainingMs: remainingNow(current),
        running: true,
        updatedAt: Date.now(),
      }
    })
    setNow(Date.now())
  }, [])

  const anotherCycle = useCallback(() => {
    setSession((current) => {
      if (!current) return current
      return {
        ...current,
        durationMs: FOCUS_MS,
        remainingMs: FOCUS_MS,
        kind: 'focus',
        running: true,
        updatedAt: Date.now(),
        alarmFired: false,
        warned: false,
      }
    })
    setNow(Date.now())
  }, [])

  const startBreak = useCallback(() => {
    setSession((current) => {
      if (!current) return current
      return {
        ...current,
        durationMs: BREAK_MS,
        remainingMs: BREAK_MS,
        kind: 'break',
        running: true,
        updatedAt: Date.now(),
        alarmFired: false,
        warned: false,
      }
    })
    setNow(Date.now())
  }, [])

  const markAlarmFired = useCallback(() => {
    setSession((current) => (current ? { ...current, alarmFired: true } : current))
  }, [])

  const markWarned = useCallback(() => {
    setSession((current) => (current ? { ...current, warned: true } : current))
  }, [])

  const clear = useCallback(() => {
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      remainingMs,
      ended,
      progress: session ? remainingMs / session.durationMs : 1,
      start,
      pause,
      resume,
      anotherCycle,
      startBreak,
      markAlarmFired,
      markWarned,
      clear,
    }),
    [
      session,
      remainingMs,
      ended,
      start,
      pause,
      resume,
      anotherCycle,
      startBreak,
      markAlarmFired,
      markWarned,
      clear,
    ]
  )

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}

export function useFocus() {
  const context = useContext(FocusContext)
  if (!context) {
    throw new Error('useFocus must be used inside FocusProvider')
  }
  return context
}
