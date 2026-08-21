export default function BottomNav({ screen, onChange, running }) {
  return (
    <nav
      className="shrink-0 border-t border-line/80 bg-ink/80 px-6 backdrop-blur-md"
      style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid h-[4.25rem] grid-cols-2">
        <TabButton
          label="Tarefas"
          active={screen === 'home'}
          onClick={() => onChange('home')}
          icon={<ListIcon />}
        />
        <TabButton
          label="Foco"
          active={screen === 'focus'}
          onClick={() => onChange('focus')}
          icon={<FocusIcon />}
          mark={running}
        />
      </div>
    </nav>
  )
}

function TabButton({ label, active, onClick, icon, mark = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-200 ${
        active ? 'text-cream' : 'text-mute'
      }`}
    >
      <span className={active ? 'text-sage' : 'text-mute'}>{icon}</span>
      <span className="text-[11px] font-medium tracking-wide">{label}</span>
      {mark && !active && (
        <span className="absolute top-2 right-[calc(50%-18px)] h-1.5 w-1.5 rounded-full bg-sage" />
      )}
    </button>
  )
}

function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7h12M8 12h12M8 17h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="4" cy="7" r="1.2" fill="currentColor" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" />
      <circle cx="4" cy="17" r="1.2" fill="currentColor" />
    </svg>
  )
}

function FocusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  )
}
