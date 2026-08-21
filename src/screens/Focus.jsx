import { useState } from 'react'
import { unlockAlarm } from '../lib/alarm'
import { FOCUS_MS, FOCUS_OPTIONS, formatMs } from '../lib/format'
import { useApp } from '../hooks/useApp'
import { useFocus } from '../hooks/useFocus'
import { useTasks } from '../hooks/useTasks'
import TimerRing from '../components/TimerRing'

export default function Focus() {
  const { pending, nowTask } = useTasks()
  const {
    session,
    remainingMs,
    progress,
    ended,
    pause,
    resume,
    anotherCycle,
    startBreak,
  } = useFocus()
  const { startFocus, leaveFocus, completeWithUndo } = useApp()
  const [duration, setDuration] = useState(FOCUS_MS)

  const focused = pending.find((task) => task.id === session?.taskId) ?? nowTask
  const isBreak = session?.kind === 'break'

  if (!focused) {
    return (
      <section className="flex min-h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-line">
          <div className="h-2.5 w-2.5 rounded-full bg-sage/70" />
        </div>
        <h1 className="text-[22px] font-medium tracking-tight text-cream">Nada para focar</h1>
        <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
          Capture um pensamento. Depois volte aqui e faça só isso.
        </p>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="flex min-h-full flex-col px-1 pt-2">
        <header className="mb-8">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage">Foco</p>
          <h1 className="mt-3 text-[26px] font-medium leading-snug tracking-tight text-cream">
            {focused.text}
          </h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center pb-8">
          <TimerRing
            progress={1}
            label={formatMs(duration)}
            caption="um ciclo"
          />
          <div className="mt-8 flex w-full max-w-xs gap-2">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option.ms}
                type="button"
                onClick={() => setDuration(option.ms)}
                className={`h-11 flex-1 rounded-full text-[13px] font-medium ${
                  duration === option.ms ? 'bg-sage text-ink' : 'bg-panel text-mute'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => startFocus(focused.id, duration)}
            className="mt-6 flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
          >
            Começar
          </button>
        </div>
      </section>
    )
  }

  const caption = ended
    ? isBreak
      ? 'pausa concluída'
      : 'ciclo concluído'
    : session.running
      ? isBreak
        ? 'descanse'
        : 'só isso'
      : 'pausado'

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
          ) : (
            <>
              <button
                type="button"
                onClick={() => completeWithUndo(focused.id)}
                className="flex h-14 items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
              >
                Concluir
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
                Mais 25 min
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
                Concluir
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}
