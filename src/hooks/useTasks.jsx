import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { startOfDay } from '../lib/format'
import { KINDS } from '../lib/kinds'

const STORAGE_KEY = 'agora.tasks.v2'
const LEGACY_KEY = 'agora.tasks.v1'
const TasksContext = createContext(null)

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeKind(kind) {
  return KINDS.some((item) => item.id === kind) ? kind : 'tarefa'
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.tasks)) {
        return {
          tasks: parsed.tasks,
          nowId: parsed.nowId ?? null,
          filter: parsed.filter ?? 'all',
        }
      }
    }

    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const tasks = JSON.parse(legacy)
      if (Array.isArray(tasks)) return { tasks, nowId: null, filter: 'all' }
    }
  } catch {
    // ignore corrupted storage
  }

  return { tasks: [], nowId: null, filter: 'all' }
}

export function TasksProvider({ children }) {
  const [{ tasks, nowId, filter }, setState] = useState(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, nowId, filter }))
  }, [tasks, nowId, filter])

  const addTask = useCallback((text, kind = 'tarefa') => {
    const trimmed = text.trim()
    if (!trimmed) return null

    const task = {
      id: createId(),
      text: trimmed,
      kind: normalizeKind(kind),
      createdAt: Date.now(),
      completedAt: null,
      remindAt: null,
      remindNotifiedAt: null,
    }

    setState((current) => ({
      tasks: [task, ...current.tasks],
      nowId: current.nowId,
      filter:
        current.filter === 'all' || task.kind === current.filter
          ? current.filter
          : 'all',
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
      filter: current.filter,
    }))
  }, [])

  const uncompleteTask = useCallback((id) => {
    setState((current) => ({
      tasks: current.tasks.map((task) =>
        task.id === id ? { ...task, completedAt: null } : task
      ),
      nowId: current.nowId ?? id,
      filter: current.filter,
    }))
  }, [])

  const setNow = useCallback((id) => {
    setState((current) => ({ ...current, nowId: id }))
  }, [])

  const setFilter = useCallback((next) => {
    setState((current) => ({ ...current, filter: next }))
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

  const splitTask = useCallback((id, parts = 3) => {
    setState((current) => {
      const task = current.tasks.find((t) => t.id === id)
      if (!task) return current

      const words = task.text.split(/\s+/).filter(Boolean)
      if (words.length <= 6) return current

      const chunkSize = Math.max(1, Math.ceil(words.length / parts))
      const newTasks = []
      for (let i = 0; i < parts; i++) {
        const start = i * chunkSize
        if (start >= words.length) break
        const chunk = words.slice(start, start + chunkSize).join(' ')
        newTasks.push({
          id: createId(),
          text: `${chunk}`,
          kind: task.kind,
          createdAt: Date.now() + i + 1,
          completedAt: null,
          remindAt: null,
          remindNotifiedAt: null,
          parentId: id,
        })
      }

      // insert new tasks right after the original
      const idx = current.tasks.findIndex((t) => t.id === id)
      const before = current.tasks.slice(0, idx + 1)
      const after = current.tasks.slice(idx + 1)
      return {
        ...current,
        tasks: [...before, ...newTasks, ...after],
        nowId: newTasks[0]?.id ?? current.nowId,
        filter: current.filter,
      }
    })
  }, [])

  const pending = useMemo(
    () => tasks.filter((task) => !task.completedAt),
    [tasks]
  )

  const visible = useMemo(() => {
    if (filter === 'all') return pending
    return pending.filter((task) => normalizeKind(task.kind) === filter)
  }, [pending, filter])

  const nowTask = useMemo(() => {
    if (visible.length === 0) return null
    return visible.find((task) => task.id === nowId) ??
      visible.reduce((oldest, task) =>
        task.createdAt < oldest.createdAt ? task : oldest
      )
  }, [visible, nowId])

  const queue = useMemo(() => {
    if (!nowTask) return []
    return visible
      .filter((task) => task.id !== nowTask.id)
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [visible, nowTask])

  const completedToday = useMemo(() => {
    const from = startOfDay()
    return tasks.filter((task) => task.completedAt && task.completedAt >= from).length
  }, [tasks])

  const value = useMemo(
    () => ({
      tasks,
      pending,
      visible,
      nowTask,
      queue,
      filter,
      completedToday,
      addTask,
      completeTask,
      uncompleteTask,
      setNow,
      setFilter,
      setReminder,
      clearReminder,
      markReminderNotified,
      splitTask,
    }),
    [
      tasks,
      pending,
      visible,
      nowTask,
      queue,
      filter,
      completedToday,
      addTask,
      completeTask,
      uncompleteTask,
      setNow,
      setFilter,
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
