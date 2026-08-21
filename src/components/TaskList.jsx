import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { useTasks } from '../hooks/useTasks'
import NowCard, { QueueItem } from './NowCard'

export default function TaskList() {
  const { nowTask, queue, completedToday } = useTasks()
  const { completeWithUndo } = useApp()
  const [exiting, setExiting] = useState({})

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
      <EmptyState done={completedToday} />
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-6">
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
            {queue.map((task) => (
              <QueueItem
                key={task.id}
                task={task}
                leaving={Boolean(exiting[task.id])}
                onComplete={() => handleComplete(task.id)}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function EmptyState({ done }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-10 text-center">
      <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-line">
        <div className="h-2.5 w-2.5 rounded-full bg-sage/70" />
      </div>
      {done > 0 ? (
        <>
          <p className="text-[20px] font-medium tracking-tight text-cream">
            {done === 1 ? '1 feita hoje' : `${done} feitas hoje`}
          </p>
          <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
            A mente pode descansar. Capture de novo quando quiser.
          </p>
        </>
      ) : (
        <>
          <p className="text-[20px] font-medium tracking-tight text-cream">Nada na frente</p>
          <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
            Toque no + e tire o pensamento da cabeça. Sem organizar, sem julgar.
          </p>
        </>
      )}
    </div>
  )
}
