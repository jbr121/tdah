import { useState } from 'react'
import { KINDS, USER_NAME } from '../lib/kinds'
import { useApp } from '../hooks/useApp'
import { useTasks } from '../hooks/useTasks'
import NowCard, { QueueItem } from './NowCard'

export default function TaskList({ name = USER_NAME }) {
  const { nowTask, queue, completedToday, filter } = useTasks()
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
    return <EmptyState done={completedToday} filter={filter} name={name} />
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

function EmptyState({ done, filter, name }) {
  const kind = KINDS.find((item) => item.id === filter)

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-10 text-center">
      <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-line">
        <div className="h-2.5 w-2.5 rounded-full bg-sage/70" />
      </div>
      {kind ? (
        <>
          <p className="text-[20px] font-medium tracking-tight text-cream">{kind.empty}</p>
          <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
            Toque no + e capture um {kind.label.toLowerCase()}, {name}.
          </p>
        </>
      ) : done > 0 ? (
        <>
          <p className="text-[20px] font-medium tracking-tight text-cream">
            {done === 1 ? '1 feita hoje' : `${done} feitas hoje`}
          </p>
          <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
            Pode descansar, {name}. Capture de novo quando quiser.
          </p>
        </>
      ) : (
        <>
          <p className="text-[20px] font-medium tracking-tight text-cream">
            Nada na frente, {name}
          </p>
          <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-mute">
            Toque no + e escolha: tarefa, estudo, lembrete ou pessoal.
          </p>
        </>
      )}
    </div>
  )
}
