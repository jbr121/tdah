import { useReminders } from '../hooks/useReminders'

export default function ReminderAlert() {
  const { alertTask, snooze, dismissAlert, focusFromAlert } = useReminders()
  if (!alertTask) return null

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/75">
      <div
        className="rounded-t-3xl border-t border-line bg-panel px-5 pt-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage">Lembrete</p>
        <h2 className="mt-3 text-[24px] font-medium leading-snug tracking-tight text-cream">
          {alertTask.text}
        </h2>
        <button
          type="button"
          onClick={() => focusFromAlert(alertTask)}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
        >
          Focar
        </button>
        <button
          type="button"
          onClick={() => snooze(alertTask)}
          className="mt-3 flex h-14 w-full items-center justify-center rounded-2xl bg-ink text-[16px] font-medium text-cream"
        >
          Daqui a 10 min
        </button>
        <button
          type="button"
          onClick={() => dismissAlert(alertTask)}
          className="mt-1 flex h-12 w-full items-center justify-center text-[15px] text-mute"
        >
          Dispensar
        </button>
      </div>
    </div>
  )
}
