import { greeting } from '../lib/format'
import { USER_NAME } from '../lib/kinds'
import { useReminders } from '../hooks/useReminders'
import { useTasks } from '../hooks/useTasks'
import KindBar from '../components/KindBar'
import TaskList from '../components/TaskList'

export default function Home() {
  const { nowTask, completedToday, filter, setFilter } = useTasks()
  const { setPrefsOpen } = useReminders()

  return (
    <section className="flex min-h-full flex-col">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium tracking-wide text-mute">{greeting()}</p>
          <h1 className="mt-1 text-[32px] font-semibold tracking-tight text-cream">Agora</h1>
          {nowTask && completedToday > 0 && (
            <p className="mt-1.5 text-[14px] text-mute">
              {completedToday === 1 ? '1 feita hoje' : `${completedToday} feitas hoje`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setPrefsOpen(true)}
          aria-label="Sons e avisos"
          className="mt-1 flex h-12 w-12 items-center justify-center rounded-full text-mute"
        >
          <SettingsIcon />
        </button>
      </header>
      <KindBar value={filter} onChange={setFilter} showAll />
      <div className="h-4" />
      <TaskList name={USER_NAME} />
    </section>
  )
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L13 2h-2L9.6 4.5a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1L11 22h2l1.4-2.5a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}
