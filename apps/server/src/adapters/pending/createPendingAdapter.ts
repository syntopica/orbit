import { readTodoSource } from '../../pending/readTodoSource'
import { summarizePending } from '../../pending/summarizePending'
import type { Adapter } from '../../types/Adapter'
import type { TodoFile } from '../../types/TodoFile'

export const createPendingAdapter = (
  files: readonly TodoFile[],
  cadenceMs: number,
): Adapter => ({
  id: 'pending',
  cadenceMs,
  timeoutMs: 25_000,
  freshnessMs: cadenceMs * 2,
  read: async (signal) => {
    const sources = await Promise.all(
      files.map(async (file) => readTodoSource(file, signal)),
    )
    const at = new Date().toISOString()
    return {
      component: 'pending',
      ...summarizePending(sources, at),
      events: [],
      observedAt: at,
    }
  },
})
