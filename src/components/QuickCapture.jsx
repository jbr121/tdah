import { useEffect, useRef, useState } from 'react'
import { USER_NAME } from '../lib/kinds'
import { useReminders } from '../hooks/useReminders'
import { useTasks } from '../hooks/useTasks'
import KindBar from './KindBar'

const LAST_KIND_KEY = 'agora.lastKind'

function loadKind() {
  try {
    return localStorage.getItem(LAST_KIND_KEY) || 'tarefa'
  } catch {
    return 'tarefa'
  }
}

export default function QuickCapture() {
  const { addTask } = useTasks()
  const { openReminder } = useReminders()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [kind, setKind] = useState(loadKind)
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const viewport = window.visualViewport
    const syncHeight = () => {
      setViewportHeight(viewport?.height ?? window.innerHeight)
    }

    syncHeight()
    viewport?.addEventListener('resize', syncHeight)
    viewport?.addEventListener('scroll', syncHeight)

    const focusId = window.setTimeout(() => inputRef.current?.focus(), 80)
    const onKey = (event) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusId)
      window.removeEventListener('keydown', onKey)
      viewport?.removeEventListener('resize', syncHeight)
      viewport?.removeEventListener('scroll', syncHeight)
    }
  }, [open])

  function close() {
    setOpen(false)
    setText('')
  }

  function save() {
    const task = addTask(text, kind)
    if (!task) return
    localStorage.setItem(LAST_KIND_KEY, kind)
    close()
    if (kind === 'lembrete') {
      window.setTimeout(() => openReminder(task), 120)
    }
  }

  const canSave = text.trim().length > 0

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setKind(loadKind())
          setOpen(true)
        }}
        aria-label="Captura rápida"
        className="absolute left-1/2 z-20 flex h-[4.25rem] w-[4.25rem] -translate-x-1/2 items-center justify-center rounded-full bg-sage text-ink shadow-[0_10px_28px_rgba(143,169,143,0.22)] transition-transform duration-150 active:scale-95"
        style={{ bottom: 'calc(4.85rem + env(safe-area-inset-bottom))' }}
      >
        <PlusIcon />
      </button>

      {open && (
        <div
          className="absolute inset-x-0 top-0 z-30 flex flex-col bg-ink"
          style={{ height: viewportHeight }}
        >
          <div
            className="flex items-center justify-between px-2"
            style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
          >
            <button
              type="button"
              onClick={close}
              className="flex min-h-12 min-w-20 items-center px-3 text-[16px] text-mute"
            >
              Cancelar
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-5 pb-4">
            <h2 className="mb-1 text-[26px] font-medium tracking-tight text-cream">
              {USER_NAME}, tira da cabeça
            </h2>
            <p className="mb-4 text-[15px] text-mute">Solta. O tipo pode ser depois.</p>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              enterKeyHint="done"
              autoCapitalize="sentences"
              autoCorrect="on"
              placeholder="O que tá na cabeça?"
              className="min-h-28 w-full flex-1 resize-none rounded-[22px] border-0 bg-panel px-4 py-4 text-[17px] leading-relaxed text-cream outline-none placeholder:text-mute/70"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  save()
                }
              }}
            />
            <p className="mt-4 mb-2 text-[12px] font-medium uppercase tracking-[0.16em] text-mute">
              Tipo, se quiser
            </p>
            <KindBar value={kind} onChange={setKind} />
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className="mt-4 flex min-h-14 w-full shrink-0 items-center justify-center rounded-2xl bg-sage text-base font-semibold text-ink transition-transform duration-150 enabled:active:scale-[0.98] disabled:opacity-35"
            >
              {kind === 'lembrete' ? 'Capturar e lembrar' : 'Capturar'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function PlusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
