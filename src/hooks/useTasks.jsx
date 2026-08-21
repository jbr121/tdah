import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { startOfDay } from '../lib/format'

const STORAGE_KEY = 'agora.tasks.v2'
const LEGACY_KEY = 'agora.tasks.v1'
const TasksContext = createContext(null)

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.tasks)) {
        return { tasks: parsed.tasks, nowId: parsed.nowId ?? null }
      }
    }

    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const tasks = JSON.parse(legacy)
      if (Array.isArray(tasks)) return { tasks, nowId: null }
    }
  } catch {
    // ignore corrupted storage
  }

  return { tasks: [], nowId: null }
}

export function TasksProvider({ children }) {
  const [{ tasks, nowId }, setState] = useState(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, nowId }))
  }, [tasks, nowId])

  const addTask = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return null

    const task = {
      id: createId(),
      text: trimmed,
      createdAt: Date.now(),
      completedAt: null,
      remindAt: null,
      remindNotifiedAt: null,
    }

    setState((current) => ({
      tasks: [task, ...current.tasks],
      nowId: current.nowId,
    }))

    return task
  }, [])

  const completeTask = useCallback((id) => {
    setState((current) => ({
      tasks: current.tasks.map((task) =>
        task.id === id && !task.completedAt
          ? { ...task, completedAt: Date.now() }
          : task
      ),
      nowId: current.nowId === id ? null : current.nowId,
    }))
  }, [])

  const uncompleteTask = useCallback((id) => {
    setState((current) => ({
      tasks: current.tasks.map((task) =>
        task.id === id ? { ...task, completedAt: null } : task
      ),
      nowId: current.nowId ?? id,
    }))
  }, [])

  const setNow = useCallback((id) => {
    setState((current) => ({ ...current, nowId: id }))
  }, [])

  const patchTask = useCallback((id, patch) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id ? { ...task, ...patch } : task
      ),
    }))
  }, [])

  const setReminder = useCallback((id, remindAt) => {
    patchTask(id, { remindAt, remindNotifiedAt: null })
  }, [patchTask])

  const clearReminder = useCallback((id) => {
    patchTask(id, { remindAt: null, remindNotifiedAt: null })
  }, [patchTask])

  const markReminderNotified = useCallback((id, remindAt) => {
    patchTask(id, { remindNotifiedAt: remindAt })
  }, [patchTask])

  const pending = useMemo(
    () => tasks.filter((task) => !task.completedAt),
    [tasks]
  )

  const nowTask = useMemo(() => {
    if (pending.length === 0) return null
    return pending.find((task) => task.id === nowId) ??
      pending.reduce((oldest, task) =>
        task.createdAt < oldest.createdAt ? task : oldest
      )
  }, [pending, nowId])

  const queue = useMemo(() => {
    if (!nowTask) return []
    return pending
      .filter((task) => task.id !== nowTask.id)
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [pending, nowTask])

  const completedToday = useMemo(() => {
    const from = startOfDay()
    return tasks.filter((task) => task.completedAt && task.completedAt >= from).length
  }, [tasks])

  const value = useMemo(
    () => ({
      tasks,
      pending,
      nowTask,
      queue,
      completedToday,
      addTask,
      completeTask,
      uncompleteTask,
      setNow,
      setReminder,
      clearReminder,
      markReminderNotified,
    }),
    [
      tasks,
      pending,
      nowTask,
      queue,
      completedToday,
      addTask,
      completeTask,
      uncompleteTask,
      setNow,
      setReminder,
      clearReminder,
      markReminderNotified,
    ]
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used inside TasksProvider')
  }
  return context
}
