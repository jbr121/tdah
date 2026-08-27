import { useState } from 'react'
import { KINDS, USER_NAME } from '../lib/kinds'
import { useApp } from '../hooks/useApp'
import { useTasks } from '../hooks/useTasks'
import NowCard, { QueueItem } from './NowCard'

const QUEUE_PREVIEW = 3

export default function TaskList({ name = USER_NAME }) {
  const { nowTask, queue, pending, visible, completedToday, filter, setFilter } = useTasks()
  const { completeWithUndo } = useApp()
  const [exiting, setExiting] = useState({})
  const [openQueue, setOpenQueue] = useState(false)

  function handleComplete(id) {
    if (exiting[id]) return
    setExiting((current) => ({ ...current, [id]: true }))
    window.setTimeout(() => {
      completeWithUndo(id)
      setExiting((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }, 480)
  }

  if (!nowTask) {
    return (
      <EmptyState
        done={completedToday}
        filter={filter}
        name={name}
        others={pending.length}
      />
    )
  }

  const hidden = pending.length - visible.length
  const shown = openQueue ? queue : queue.slice(0, QUEUE_PREVIEW)
  const rest = queue.length - shown.length

  return (
    <div className="flex flex-col gap-8 pb-6">
      {filter !== 'all' && hidden > 0 && (
        <button
          type="button"
          onClick={() => setFilter('all')}
          className="rounded-2xl bg-panel/80 px-4 py-3 text-left text-[14px] leading-snug text-mute"
        >
          {hidden === 1 ? '1 outra continua em Tudo.' : `${hidden} outras continuam em Tudo.`} Não sumiu.
        </button>
      )}

      <NowCard
        task={nowTask}
        leaving={Boolean(exiting[nowTask.id])}
        onComplete={() => handleComplete(nowTask.id)}
      />

      {queue.length > 0 && (
        <section>
          <h2 className="mb-3 px-1 text-[12px] font-medium uppercase tracking-[0.16em] text-mute">
            Depois
          </h2>
          <ul>
            {shown.map((task) => (
              <QueueItem
                key={task.id}
                task={task}
                leaving={Boolean(exiting[task.id])}
                onComplete={() => handleComplete(task.id)}
              />
            ))}
          </ul>
          {rest > 0 && (
            <button
              type="button"
              onClick={() => setOpenQueue(true)}
              className="mt-1 flex min-h-12 w-full items-center justify-center text-[14px] text-mute"
            >
              {rest === 1 ? 'Mais 1 na cabeça. Pode deixar quieto.' : `Mais ${rest} na cabeça. Pode deixar quieto.`}
            </button>
          )}
        </section>
      )}
    </div>
  )
}

function EmptyState({ done, filter, name, others = 0 }) {
  const kind = KINDS.find((item) => item.id === filter)

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-16 pt-10 text-center">
      <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-line">
        <div className="h-2.5 w-2.5 rounded-full bg-sage/70" />
      </div>
      {kind ? (
        <>
          <p className="text-[20px] font-medium tracking-tight text-cream">{kind.empty}</p>
          <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
            {others > 0
              ? 'As outras não sumiram. Volte em Tudo, ou capture no +.'
              : `Toque no + e solta um ${kind.label.toLowerCase()}, ${name}.`}
          </p>
        </>
      ) : done > 0 ? (
        <>
          <p className="text-[20px] font-medium tracking-tight text-cream">
            {done === 1 ? '1 feita hoje' : `${done} feitas hoje`}
          </p>
          <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
            Pode parar aqui, {name}. Não precisa encadear outra.
          </p>
        </>
      ) : (
        <>
          <p className="text-[20px] font-medium tracking-tight text-cream">
            Nada na frente, {name}
          </p>
          <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
            Toque no + e solta o que tiver na cabeça. Sem organizar.
          </p>
        </>
      )}
    </div>
  )
}
