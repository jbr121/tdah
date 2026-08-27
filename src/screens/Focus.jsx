import { useEffect, useRef, useState } from 'react'
import { unlockAlarm } from '../lib/alarm'
import { feltCaption, FOCUS_MS, FOCUS_OPTIONS, formatMs, TEN_MS } from '../lib/format'
import { defaultFocusMs, isSparkDuration, kindOf, SPARK_MS } from '../lib/kinds'
import { useApp } from '../hooks/useApp'
import { useFocus } from '../hooks/useFocus'
import { useTasks } from '../hooks/useTasks'
import TimerRing from '../components/TimerRing'

export default function Focus() {
  const { pending, nowTask, addTask } = useTasks()
  const {
    session,
    remainingMs,
    progress,
    ended,
    pause,
    resume,
    anotherCycle,
    startBreak,
    start,
  } = useFocus()
  const { startFocus, leaveFocus, completeWithUndo } = useApp()

  const focused = pending.find((task) => task.id === session?.taskId) ?? nowTask
  const [duration, setDuration] = useState(() => defaultFocusMs())
  const [parking, setParking] = useState(false)
  const [parked, setParked] = useState(false)
  const isBreak = session?.kind === 'break'
  const kind = kindOf(focused)
  const spark = isSparkDuration(session?.durationMs)

  useEffect(() => {
    if (!session) setDuration(defaultFocusMs())
  }, [focused?.id, session])

  if (!focused) {
    return (
      <section className="flex min-h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-line">
          <div className="h-2.5 w-2.5 rounded-full bg-sage/70" />
        </div>
        <h1 className="text-[22px] font-medium tracking-tight text-cream">Nada para focar</h1>
        <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
          Capture um pensamento, Malu. Depois volte e faça só o primeiro pedaço.
        </p>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="flex min-h-full flex-col px-1 pt-2">
        <header className="mb-8">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage">
            {kind.label}
          </p>
          <h1 className="mt-3 text-[26px] font-medium leading-snug tracking-tight text-cream">
            {focused.text}
          </h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center pb-8">
          <TimerRing
            progress={1}
            label={formatMs(duration)}
            caption={duration <= SPARK_MS + 1000 ? 'só pra entrar' : 'um ciclo'}
          />
          <div className="mt-8 grid w-full max-w-xs grid-cols-2 gap-2">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option.ms}
                type="button"
                onClick={() => setDuration(option.ms)}
                className={`h-12 rounded-2xl text-[14px] font-medium ${
                  duration === option.ms ? 'bg-sage text-ink' : 'bg-panel text-mute'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-xs text-center text-[13px] leading-relaxed text-mute">
            {duration <= SPARK_MS + 1000
              ? 'Dois minutos atravessam a trava de começar. Depois você decide.'
              : 'Pode parar no meio. Não conta como falha.'}
          </p>
          <button
            type="button"
            onClick={() => startFocus(focused.id, duration)}
            className="mt-6 flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
          >
            {duration <= SPARK_MS + 1000 ? 'Só 2 min' : 'Começar'}
          </button>
        </div>
      </section>
    )
  }

  const caption = feltCaption(progress, remainingMs, {
    ended,
    running: session.running,
    isBreak,
    isSpark: spark,
  })

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header
        className="flex items-center justify-between px-1"
        style={{ paddingTop: '0.25rem' }}
      >
        <button
          type="button"
          onClick={leaveFocus}
          className="flex min-h-12 min-w-[4.5rem] items-center text-[16px] text-mute"
        >
          Sair
        </button>
        {!isBreak && !ended && (
          <button
            type="button"
            onClick={() => setParking(true)}
            className="flex min-h-12 items-center px-2 text-[15px] text-mute"
          >
            Tá na cabeça
          </button>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <p className="mb-8 line-clamp-3 max-w-[20rem] text-center text-[18px] font-medium leading-snug tracking-tight text-cream">
          {isBreak ? 'Pausa' : focused.text}
        </p>
        <TimerRing
          progress={ended ? 0 : progress}
          label={formatMs(remainingMs)}
          caption={caption}
          size={248}
        />
        {parked && (
          <p className="mt-4 text-[13px] text-sage">Guardei. Continua aqui.</p>
        )}
      </div>

      <div
        className="flex shrink-0 flex-col gap-3 px-1 pt-4"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {ended ? (
          isBreak ? (
            <>
              <button
                type="button"
                onClick={() => {
                  unlockAlarm()
                  anotherCycle()
                }}
                className="flex h-14 items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
              >
                Focar de novo
              </button>
              <button
                type="button"
                onClick={() => {
                  unlockAlarm()
                  startBreak()
                }}
                className="flex h-14 items-center justify-center rounded-2xl bg-panel text-[16px] font-medium text-cream"
              >
                Mais 5 min
              </button>
            </>
          ) : spark ? (
            <>
              <button
                type="button"
                onClick={() => {
                  unlockAlarm()
                  start(focused.id, TEN_MS)
                }}
                className="flex h-14 items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
              >
                Continuar 10 min
              </button>
              <button
                type="button"
                onClick={() => {
                  unlockAlarm()
                  start(focused.id, FOCUS_MS)
                }}
                className="flex h-14 items-center justify-center rounded-2xl bg-panel text-[16px] font-medium text-cream"
              >
                Continuar 25 min
              </button>
              <button
                type="button"
                onClick={leaveFocus}
                className="flex h-12 items-center justify-center text-[15px] text-mute"
              >
                Já deu por agora
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => completeWithUndo(focused.id)}
                className="flex h-14 items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
              >
                Serve, concluir
              </button>
              <button
                type="button"
                onClick={() => {
                  unlockAlarm()
                  startBreak()
                }}
                className="flex h-14 items-center justify-center rounded-2xl bg-panel text-[16px] font-medium text-cream"
              >
                Pausa 5 min
              </button>
              <button
                type="button"
                onClick={() => {
                  unlockAlarm()
                  anotherCycle()
                }}
                className="flex h-12 items-center justify-center text-[15px] text-mute"
              >
                Mais um ciclo
              </button>
            </>
          )
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                unlockAlarm()
                if (session.running) pause()
                else resume()
              }}
              className="flex h-14 items-center justify-center rounded-2xl bg-panel text-[16px] font-medium text-cream active:scale-[0.98]"
            >
              {session.running ? 'Pausar' : 'Continuar'}
            </button>
            {!isBreak && (
              <button
                type="button"
                onClick={() => completeWithUndo(focused.id)}
                className="flex h-14 items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
              >
                Serve, concluir
              </button>
            )}
          </>
        )}
      </div>

      {parking && (
        <ParkSheet
          onClose={() => setParking(false)}
          onSave={(text) => {
            const task = addTask(text)
            if (!task) return
            setParking(false)
            setParked(true)
            window.setTimeout(() => setParked(false), 2500)
          }}
        />
      )}
    </section>
  )
}

function ParkSheet({ onClose, onSave }) {
  const [text, setText] = useState('')
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight)
  const inputRef = useRef(null)

  useEffect(() => {
    const viewport = window.visualViewport
    const syncHeight = () => setViewportHeight(viewport?.height ?? window.innerHeight)
    syncHeight()
    viewport?.addEventListener('resize', syncHeight)
    const id = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => {
      window.clearTimeout(id)
      viewport?.removeEventListener('resize', syncHeight)
    }
  }, [])

  const canSave = text.trim().length > 0

  return (
    <div
      className="absolute inset-x-0 top-0 z-40 flex flex-col bg-ink/95"
      style={{ height: viewportHeight }}
    >
      <div
        className="flex items-center justify-between px-2"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-12 min-w-20 items-center px-3 text-[16px] text-mute"
        >
          Voltar
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-4">
        <h2 className="mb-1 text-[24px] font-medium tracking-tight text-cream">
          Guarda e continua
        </h2>
        <p className="mb-4 text-[15px] text-mute">Não precisa resolver agora. O timer segue.</p>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          enterKeyHint="done"
          autoCapitalize="sentences"
          placeholder="O que passou na cabeça?"
          className="min-h-28 w-full flex-1 resize-none rounded-[22px] border-0 bg-panel px-4 py-4 text-[17px] leading-relaxed text-cream outline-none placeholder:text-mute/70"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              if (canSave) onSave(text)
            }
          }}
        />
        <button
          type="button"
          onClick={() => canSave && onSave(text)}
          disabled={!canSave}
          className="mt-4 flex min-h-14 w-full shrink-0 items-center justify-center rounded-2xl bg-sage text-base font-semibold text-ink enabled:active:scale-[0.98] disabled:opacity-35"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}
