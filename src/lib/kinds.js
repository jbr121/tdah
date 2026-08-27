export const USER_NAME = 'Malu'

export const KINDS = [
  { id: 'tarefa', label: 'Tarefa', empty: 'Nenhuma tarefa na frente' },
  { id: 'estudo', label: 'Estudo', empty: 'Nenhum estudo na frente' },
  { id: 'lembrete', label: 'Lembrete', empty: 'Nenhum lembrete na frente' },
  { id: 'pessoal', label: 'Pessoal', empty: 'Nada pessoal na frente' },
]

export function kindOf(task) {
  const id = task?.kind
  return KINDS.find((kind) => kind.id === id) ?? KINDS[0]
}

export const SPARK_MS = 2 * 60 * 1000

export function defaultFocusMs() {
  return SPARK_MS
}

export function isSparkDuration(ms) {
  return Boolean(ms) && ms <= SPARK_MS + 1000
}
