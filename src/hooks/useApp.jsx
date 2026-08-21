import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { unlockAlarm } from '../lib/alarm'
import { FOCUS_MS } from '../lib/format'
import { useFocus } from './useFocus'
import { useTasks } from './useTasks'

const AppContext = createContext(null)

export function AppStateProvider({ children }) {
  const { nowTask, setNow, completeTask, uncompleteTask } = useTasks()
  const focus = useFocus()
  const [screen, setScreen] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('agora.focus.v1'))
      return saved?.running ? 'focus' : 'home'
    } catch {
      return 'home'
    }
  })
  const [undo, setUndo] = useState(null)
  const undoTimer = useRef(null)

  useEffect(() => {
    return () => window.clearTimeout(undoTimer.current)
  }, [])

  const startFocus = useCallback(
    (taskId, durationMs) => {
      const id = taskId ?? nowTask?.id
      if (!id) {
        setScreen('focus')
        return
      }

      unlockAlarm()
      setNow(id)

      const sameTask = focus.session?.taskId === id
      if (!sameTask) {
        focus.start(id, durationMs ?? FOCUS_MS)
      } else if (!focus.session.running && focus.remainingMs > 0 && !durationMs) {
        focus.resume()
      } else if (focus.ended && !durationMs) {
        focus.anotherCycle()
      } else if (durationMs) {
        focus.start(id, durationMs)
      }

      setScreen('focus')
    },
    [nowTask, setNow, focus]
  )

  const leaveFocus = useCallback(() => {
    if (focus.session?.running) focus.pause()
    setScreen('home')
  }, [focus])

  const completeWithUndo = useCallback(
    (id) => {
      completeTask(id)
      if (focus.session?.taskId === id) focus.clear()
      setUndo({ id })
      setScreen('home')
      window.clearTimeout(undoTimer.current)
      undoTimer.current = window.setTimeout(() => setUndo(null), 5000)
    },
    [completeTask, focus]
  )

  const undoComplete = useCallback(() => {
    if (!undo) return
    uncompleteTask(undo.id)
    setUndo(null)
    window.clearTimeout(undoTimer.current)
  }, [undo, uncompleteTask])

  const hideChrome = screen === 'focus' && Boolean(focus.session)

  const value = useMemo(
    () => ({
      screen,
      setScreen,
      startFocus,
      leaveFocus,
      completeWithUndo,
      undoComplete,
      undo,
      hideChrome,
    }),
    [screen, startFocus, leaveFocus, completeWithUndo, undoComplete, undo, hideChrome]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used inside AppStateProvider')
  }
  return context
}
