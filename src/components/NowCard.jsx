import { formatMs, formatWhen } from '../lib/format'
import { useApp } from '../hooks/useApp'
import { useFocus } from '../hooks/useFocus'
import { useReminders } from '../hooks/useReminders'
import { useTasks } from '../hooks/useTasks'
import TimerRing from './TimerRing'

export default function NowCard({ task, leaving, onComplete }) {
  const { startFocus } = useApp()
  const { session, remainingMs, progress, ended } = useFocus()
  const { openReminder } = useReminders()
  const isFocused = session?.taskId === task.id
  const hasCycle = isFocused && remainingMs < (session?.durationMs ?? 0)
  const cta = ended && isFocused ? 'Outro ciclo' : hasCycle ? 'Continuar' : 'Focar'
  const upcoming = task.remindAt && task.remindAt > Date.now()

  return (
    <article
      className={`now-card overflow-hidden rounded-[28px] border border-sage/20 bg-panel px-5 py-5 transition-all duration-500 ${
        leaving ? 'scale-[0.98] opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage">Agora</p>
        <button
          type="button"
          onClick={() => openReminder(task)}
          aria-label="Lembrar"
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            upcoming ? 'text-sage' : 'text-mute'
          }`}
        >
          <BellIcon />
        </button>
      </div>
      <p
        className={`mt-2 line-clamp-4 text-[22px] font-medium leading-snug tracking-tight text-cream ${
          leaving ? 'text-mute line-through decoration-mute/80' : ''
        }`}
      >
        {task.text}
      </p>
      {upcoming && (
        <p className="mt-2 text-[13px] text-mute">Lembra {formatWhen(task.remindAt)}</p>
      )}

      {hasCycle && !leaving && (
        <div className="mt-5 flex items-center gap-4">
          <TimerRing
            progress={progress}
            label={formatMs(remainingMs)}
            size={72}
          />
          <p className="text-[14px] text-mute">
            {ended ? 'Ciclo concluído' : session?.running ? 'Em foco' : 'Pausado'}
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onComplete}
          aria-label={`Concluir: ${task.text}`}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] transition-colors duration-300 ${
              leaving ? 'border-sage bg-sage' : 'border-mute/60'
            }`}
          >
            {leaving && <CheckIcon />}
          </span>
        </button>
        <button
          type="button"
          onClick={() => startFocus(task.id)}
          className="flex h-14 min-w-0 flex-1 items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink transition-transform duration-150 active:scale-[0.98]"
        >
          {cta}
        </button>
      </div>
    </article>
  )
}

export function QueueItem({ task, leaving, onComplete }) {
  const { startFocus } = useApp()
  const { setNow } = useTasks()
  const { openReminder } = useReminders()
  const upcoming = task.remindAt && task.remindAt > Date.now()

  return (
    <li
      className={`task-enter grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
        leaving ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
      }`}
    >
      <div className="overflow-hidden">
        <div className="mb-2 flex min-h-[3.75rem] items-center gap-1 rounded-2xl bg-panel/80 px-2 py-2">
          <button
            type="button"
            onClick={onComplete}
            aria-label={`Concluir: ${task.text}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] transition-colors duration-300 ${
                leaving ? 'border-sage bg-sage' : 'border-mute/50'
              }`}
            >
              {leaving && <CheckIcon small />}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setNow(task.id)
              startFocus(task.id)
            }}
            className="min-w-0 flex-1 py-2 pr-1 text-left"
          >
            <p
              className={`line-clamp-2 text-[15px] leading-snug text-cream/90 ${
                leaving ? 'text-mute line-through' : ''
              }`}
            >
              {task.text}
            </p>
            {upcoming && (
              <p className="mt-0.5 text-[12px] text-mute">{formatWhen(task.remindAt)}</p>
            )}
          </button>
          <button
            type="button"
            onClick={() => openReminder(task)}
            aria-label="Lembrar"
            className={`flex h-12 w-12 shrink-0 items-center justify-center ${
              upcoming ? 'text-sage' : 'text-mute'
            }`}
          >
            <BellIcon />
          </button>
        </div>
      </div>
    </li>
  )
}

export function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 10a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 17.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ small = false }) {
  const size = small ? 12 : 14
  return (
    <svg
      className="check-pop text-ink"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
