import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ensureNotifyPermission } from '../lib/notify'

const STORAGE_KEY = 'agora.prefs.v1'
const PrefsContext = createContext(null)

const defaults = {
  sound: true,
  notify: true,
  dailyAt: '',
  lastDaily: '',
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults }
  } catch {
    return { ...defaults }
  }
}

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [prefs])

  const updatePrefs = useCallback(async (patch) => {
    if (patch.notify === true) {
      const granted = await ensureNotifyPermission()
      patch = { ...patch, notify: granted }
    }
    setPrefs((current) => ({ ...current, ...patch }))
  }, [])

  const value = useMemo(() => ({ prefs, updatePrefs }), [prefs, updatePrefs])

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  const context = useContext(PrefsContext)
  if (!context) {
    throw new Error('usePrefs must be used inside PrefsProvider')
  }
  return context
}
