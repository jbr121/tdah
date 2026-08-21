import { useState } from 'react'
import { isStandalone, sendTestPush } from '../lib/push'
import { usePrefs } from '../hooks/usePrefs'
import { useReminders } from '../hooks/useReminders'

export default function PrefsSheet() {
  const { prefsOpen, setPrefsOpen, enablePush } = useReminders()
  const { prefs, updatePrefs } = usePrefs()
  const [status, setStatus] = useState('')
  const standalone = isStandalone()

  if (!prefsOpen) return null

  async function activate() {
    const result = await enablePush()
    if (result.ok) setStatus('Avisos ligados. Pode fechar o app.')
    else if (result.reason === 'denied') setStatus('O iPhone bloqueou. Ajustes → Malu → Avisos.')
    else setStatus('Abra pelo ícone da Tela de Início e tente de novo.')
  }

  async function test() {
    const result = await sendTestPush()
    setStatus(result.ok ? 'Mandei um teste. Bloqueia a tela e espera uns segundos.' : 'Não consegui enviar o teste.')
  }

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

        {!standalone && (
          <p className="mt-4 rounded-2xl bg-ink px-4 py-3 text-[14px] leading-relaxed text-mute">
            No iPhone: Safari → Compartilhar → Adicionar à Tela de Início. Abra pelo ícone novo, não pela aba.
          </p>
        )}

        <button
          type="button"
          onClick={activate}
          className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-sage text-[16px] font-semibold text-ink"
        >
          Ativar avisos no iPhone
        </button>
        <button
          type="button"
          onClick={test}
          className="mt-2 flex h-12 w-full items-center justify-center text-[15px] text-mute"
        >
          Enviar aviso de teste
        </button>
        {status && <p className="mt-3 text-[14px] leading-relaxed text-cream">{status}</p>}

        <Toggle
          label="Som do alarme"
          hint="Toque suave quando o app estiver aberto"
          on={prefs.sound}
          onChange={(sound) => updatePrefs({ sound })}
        />
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
