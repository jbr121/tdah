import { KINDS } from '../lib/kinds'

export default function KindBar({ value, onChange, showAll = false }) {
  const options = showAll ? [{ id: 'all', label: 'Tudo' }, ...KINDS] : KINDS

  return (
    <div className="chip-row -mx-1 mb-1 px-1">
      {options.map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`h-11 shrink-0 rounded-full px-4 text-[14px] font-medium transition-colors ${
              active ? 'bg-sage text-ink' : 'bg-panel text-mute'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
