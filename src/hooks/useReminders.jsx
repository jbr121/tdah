import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { playChime, playTap, unlockAlarm } from '../lib/alarm'
import { ensureNotifyPermission, notify } from '../lib/notify'
import { useFocus } from './useFocus'
import { usePrefs } from './usePrefs'
import { useTasks } from './useTasks'
import { useApp } from './useApp'

const RemindersContext = createContext(null)

function todayKey() {
  return new Date().toDateString()
}

function nextDailyAt(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1)
  return date.getTime()
}

export function RemindersProvider({ children }) {
  const { pending, setReminder, clearReminder, markReminderNotified } = useTasks()
  const { prefs, updatePrefs } = usePrefs()
  const { session, remainingMs, ended, markAlarmFired, markWarned } = useFocus()
  const { screen, startFocus } = useApp()
  const [sheetTask, setSheetTask] = useState(null)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [alertTask, setAlertTask] = useState(null)
  const busyFocus = screen === 'focus' && Boolean(session?.running)

  const fireTaskReminder = useCallback(
    (task) => {
      if (!task?.remindAt) return
      if (task.remindNotifiedAt === task.remindAt) {
        if (!busyFocus) setAlertTask(task)
        return
      }

      markReminderNotified(task.id, task.remindAt)
      if (prefs.sound) playChime()
      if (prefs.notify) {
        notify({
          title: 'Hora de olhar pra isso',
          body: task.text,
          tag: `task-${task.id}`,
        })
      }
      if (!busyFocus) setAlertTask(task)
    },
    [busyFocus, markReminderNotified, prefs.notify, prefs.sound]
  )

  useEffect(() => {
    const due = pending.filter(
      (task) => task.remindAt && task.remindAt <= Date.now()
    )
    if (due[0]) fireTaskReminder(due[0])

    const timers = pending
      .filter((task) => task.remindAt && task.remindAt > Date.now())
      .map((task) => {
        const delay = Math.min(task.remindAt - Date.now(), 2_147_000_000)
        return window.setTimeout(() => fireTaskReminder(task), delay)
      })

    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [pending, fireTaskReminder])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const due = pending.find((task) => task.remindAt && task.remindAt <= Date.now())
      if (due) fireTaskReminder(due)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [pending, fireTaskReminder])

  useEffect(() => {
    if (!prefs.dailyAt) return undefined

    const fireDaily = () => {
      if (prefs.lastDaily === todayKey()) return
      updatePrefs({ lastDaily: todayKey() })
      if (prefs.sound) playChime()
      if (prefs.notify) {
        notify({
          title: 'Agora',
          body: 'O que precisa sair da cabeça?',
          tag: 'agora-daily',
        })
      }
    }

    const next = nextDailyAt(prefs.dailyAt)
    const [hours, minutes] = prefs.dailyAt.split(':').map(Number)
    const todaySlot = new Date()
    todaySlot.setHours(hours, minutes, 0, 0)
    if (Date.now() >= todaySlot.getTime() && prefs.lastDaily !== todayKey()) {
      fireDaily()
    }

    const delay = Math.min(next - Date.now(), 2_147_000_000)
    const id = window.setTimeout(fireDaily, delay)
    return () => window.clearTimeout(id)
  }, [prefs.dailyAt, prefs.lastDaily, prefs.notify, prefs.sound, updatePrefs])

  useEffect(() => {
    if (!ended || !session || session.alarmFired) return
    markAlarmFired()
    if (prefs.sound) playChime()
    if (prefs.notify) {
      const task = pending.find((item) => item.id === session.taskId)
      notify({
        title: session.kind === 'break' ? 'Pausa acabou' : 'Ciclo concluído',
        body: task?.text || 'Volte quando puder.',
        tag: 'agora-focus',
      })
    }
  }, [ended, session, markAlarmFired, pending, prefs.notify, prefs.sound])

  useEffect(() => {
    if (!session?.running || session.warned || remainingMs > 60_000 || remainingMs <= 0) return
    markWarned()
    if (prefs.sound) playTap()
  }, [session, remainingMs, markWarned, prefs.sound])

  const openReminder = useCallback((task) => {
    setSheetTask(task)
  }, [])

  const closeReminder = useCallback(() => {
    setSheetTask(null)
  }, [])

  const saveReminder = useCallback(
    async (task, remindAt, calendar) => {
      setReminder(task.id, remindAt)
      if (prefs.notify) await ensureNotifyPermission()
      unlockAlarm()
      setSheetTask(calendar ? { ...task, remindAt, askCalendar: true } : null)
      if (!calendar) setSheetTask(null)
    },
    [prefs.notify, setReminder]
  )

  const snooze = useCallback(
    (task, ms = 10 * 60 * 1000) => {
      setReminder(task.id, Date.now() + ms)
      setAlertTask(null)
    },
    [setReminder]
  )

  const dismissAlert = useCallback(
    (task) => {
      clearReminder(task.id)
      setAlertTask(null)
    },
    [clearReminder]
  )

  const focusFromAlert = useCallback(
    (task) => {
      clearReminder(task.id)
      setAlertTask(null)
      startFocus(task.id)
    },
    [clearReminder, startFocus]
  )

  const value = useMemo(
    () => ({
      sheetTask,
      prefsOpen,
      alertTask,
      openReminder,
      closeReminder,
      saveReminder,
      setPrefsOpen,
      snooze,
      dismissAlert,
      focusFromAlert,
      setSheetTask,
    }),
    [
      sheetTask,
      prefsOpen,
      alertTask,
      openReminder,
      closeReminder,
      saveReminder,
      snooze,
      dismissAlert,
      focusFromAlert,
    ]
  )

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>
}

export function useReminders() {
  const context = useContext(RemindersContext)
  if (!context) {
    throw new Error('useReminders must be used inside RemindersProvider')
  }
  return context
}
