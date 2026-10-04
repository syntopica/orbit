import { readTodoSource } from '../../pending/readTodoSource'
import { summarizePending } from '../../pending/summarizePending'
import type { Adapter } from '../../types/Adapter'
import type { TodoFile } from '../../types/TodoFile'
import { backlogHealth } from '../backlogHealth'

export const createPendingAdapter = (
  files: readonly TodoFile[],
  cadenceMs: number,
  blockedLimit?: number,
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
    const summary = summarizePending(sources, at)
    const blocked =
      summary.metrics.find((m) => m.key === 'pending.blocked')?.value ?? 0
    return {
      component: 'pending',
      ...summary,
      health: backlogHealth(
        summary.health,
        blockedLimit !== undefined && blocked > blockedLimit,
      ),
      events: [],
      observedAt: at,
    }
  },
})
