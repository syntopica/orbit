import type { WorkerActivity } from '@orbit/contract'

import type { QueueAccumulator } from '../types/QueueAccumulator'
import type { QueueActivity } from '../types/QueueActivity'
import { addQueueRow } from './addQueueRow'
import { bucketIndex } from './bucketIndex'
import { toQueueActivity } from './toQueueActivity'

// Per-queue rollups of production attempts on the axis; sampling is left out.
export const selectQueueActivity = (
  view: WorkerActivity,
  starts: readonly number[],
): Map<string, QueueActivity> => {
  const queues = new Map<string, QueueAccumulator>()
  for (const row of view.rows) {
    const index = bucketIndex(starts, view.bucketMs, row.bucket)
    if (row.sampling || index < 0) continue
    const acc = queues.get(row.queue) ?? {
      succeeded: starts.map(() => 0),
      outcomes: new Map(),
      providers: new Map(),
      errors: new Map(),
      wallMs: 0,
      attempts: 0,
      tokensIn: 0,
      tokensOut: 0,
    }
    queues.set(row.queue, acc)
    addQueueRow(acc, row, index)
  }
  return new Map([...queues].map(([name, acc]) => [name, toQueueActivity(acc)]))
}
