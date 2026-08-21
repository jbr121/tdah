import { openCalendarAlarm } from '../lib/calendar'
import { atFromTime } from '../lib/format'
import { usePrefs } from '../hooks/usePrefs'
import { useReminders } from '../hooks/useReminders'

export default function PrefsSheet() {
  const { prefsOpen, setPrefsOpen } = useReminders()
  const { prefs, updatePrefs } = usePrefs()

  if (!prefsOpen) return null

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70">
      <button
        type="button"
        aria-label="Fechar"
        className="min-h-0 flex-1"
        onClick={() => setPrefsOpen(false)}
      />
      <div
        className="rounded-t-3xl border-t border-line bg-panel px-5 pt-4"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage">Sons e avisos</p>
        <h2 className="mt-2 text-[22px] font-medium tracking-tight text-cream">Como te chamar</h2>

        <Toggle
          label="Som do alarme"
          hint="Toque suave no fim do ciclo e nos lembretes"
          on={prefs.sound}
          onChange={(sound) => updatePrefs({ sound })}
        />
        <Toggle
          label="Notificações"
          hint="No iPhone, adicione o app à Tela de Início e permita avisos"
          on={prefs.notify}
          onChange={(notify) => updatePrefs({ notify })}
        />

        <p className="mt-6 text-[13px] text-mute">Lembrete diário</p>
        <div className="mt-2 flex gap-2">
          <input
            type="time"
            value={prefs.dailyAt || '09:00'}
            onChange={(event) => updatePrefs({ dailyAt: event.target.value })}
            className="h-14 flex-1 rounded-2xl border-0 bg-ink px-4 text-[16px] text-cream outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const at = prefs.dailyAt || '09:00'
              updatePrefs({ dailyAt: at })
              openCalendarAlarm({
                title: 'O que precisa sair da cabeça?',
                at: atFromTime(at),
                daily: true,
              })
            }}
            className="h-14 rounded-2xl bg-sage px-4 text-[14px] font-semibold text-ink"
          >
            Calendário
          </button>
        </div>
        {prefs.dailyAt ? (
          <button
            type="button"
            onClick={() => updatePrefs({ dailyAt: '' })}
            className="mt-2 flex h-11 w-full items-center justify-center text-[14px] text-mute"
          >
            Desligar lembrete diário
          </button>
        ) : (
          <p className="mt-2 text-[13px] leading-relaxed text-mute">
            Defina um horário e, no iPhone, toque em Calendário para o alarme repetir todos os dias.
          </p>
        )}
      </div>
    </div>
  )
}

function Toggle({ label, hint, on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="mt-5 flex w-full items-center justify-between gap-4 text-left"
    >
      <span>
        <span className="block text-[16px] text-cream">{label}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-mute">{hint}</span>
      </span>
      <span
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          on ? 'bg-sage' : 'bg-ink'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-cream transition-transform ${
            on ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}
