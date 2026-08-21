import { useMemo, useState } from 'react'
import { openCalendarAlarm } from '../lib/calendar'
import { atFromTime, formatWhen, isIos, reminderPresets } from '../lib/format'
import { useReminders } from '../hooks/useReminders'
import { useTasks } from '../hooks/useTasks'

export default function ReminderSheet() {
  const { sheetTask, closeReminder, saveReminder, setSheetTask } = useReminders()
  const { clearReminder } = useTasks()
  const presets = useMemo(() => reminderPresets(), [sheetTask?.id])
  const [custom, setCustom] = useState('09:00')
  const [calendar, setCalendar] = useState(() => isIos())

  if (!sheetTask) return null

  if (sheetTask.askCalendar && sheetTask.remindAt) {
    return (
      <Sheet onClose={closeReminder}>
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage">Alarme</p>
        <h2 className="mt-2 text-[22px] font-medium tracking-tight text-cream">
          No iPhone, o Calendário toca mesmo com o app fechado.
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-mute">
          Lembrete interno às {formatWhen(sheetTask.remindAt)}. Adicione o alarme nativo se quiser sair do app.
        </p>
        <button
          type="button"
          onClick={() => {
            openCalendarAlarm({ title: sheetTask.text, at: sheetTask.remindAt })
            closeReminder()
          }}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink active:scale-[0.98]"
        >
          Adicionar ao Calendário
        </button>
        <button
          type="button"
          onClick={closeReminder}
          className="mt-2 flex h-12 w-full items-center justify-center text-[15px] text-mute"
        >
          Agora não
        </button>
      </Sheet>
    )
  }

  return (
    <Sheet onClose={closeReminder}>
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage">Lembrar</p>
      <h2 className="mt-2 line-clamp-2 text-[22px] font-medium tracking-tight text-cream">
        {sheetTask.text}
      </h2>
      <p className="mt-1 text-[14px] text-mute">Quando te chamo, Malu?</p>
      {sheetTask.remindAt && (
        <p className="mt-1 text-[14px] text-mute">Já está em {formatWhen(sheetTask.remindAt)}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => saveReminder(sheetTask, preset.at, calendar)}
            className="flex h-14 items-center justify-center rounded-2xl bg-ink text-[15px] font-medium text-cream active:scale-[0.98]"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-[13px] text-mute">Horário</label>
      <div className="mt-2 flex gap-2">
        <input
          type="time"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          className="h-14 flex-1 rounded-2xl border-0 bg-ink px-4 text-[16px] text-cream outline-none"
        />
        <button
          type="button"
          onClick={() => saveReminder(sheetTask, atFromTime(custom), calendar)}
          className="h-14 rounded-2xl bg-sage px-5 text-[15px] font-semibold text-ink"
        >
          Ok
        </button>
      </div>

      <label className="mt-5 flex min-h-12 items-center gap-3 text-[15px] text-cream">
        <input
          type="checkbox"
          checked={calendar}
          onChange={(event) => setCalendar(event.target.checked)}
          className="h-5 w-5 accent-sage"
        />
        Alarme no Calendário (iPhone)
      </label>

      {sheetTask.remindAt && (
        <button
          type="button"
          onClick={() => {
            clearReminder(sheetTask.id)
            setSheetTask(null)
          }}
          className="mt-4 flex h-12 w-full items-center justify-center text-[15px] text-mute"
        >
          Remover lembrete
        </button>
      )}
    </Sheet>
  )
}

function Sheet({ children, onClose }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70">
      <button type="button" aria-label="Fechar" className="min-h-0 flex-1" onClick={onClose} />
      <div
        className="rounded-t-3xl border-t border-line bg-panel px-5 pt-4"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        {children}
      </div>
    </div>
  )
}
