import { useApp } from '../hooks/useApp'

export default function UndoToast() {
  const { undo, undoComplete } = useApp()
  if (!undo) return null

  return (
    <div
      className="toast-in absolute inset-x-4 z-20 flex items-center justify-between rounded-2xl bg-panel-2 px-4 py-3"
      style={{ bottom: 'calc(9.25rem + env(safe-area-inset-bottom))' }}
    >
      <p className="text-[15px] text-cream">Feito.</p>
      <button
        type="button"
        onClick={undoComplete}
        className="min-h-10 px-2 text-[15px] font-medium text-sage"
      >
        Desfazer
      </button>
    </div>
  )
}
