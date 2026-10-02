import type { SnapshotCore } from '@orbit/contract'

import type { WorkerStatus } from '../../types/WorkerStatus'
import { sumQueueState } from './sumQueueState'
import { workerPending } from './workerPending'

export const summarizeWorker = (
  status: WorkerStatus,
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const queues = Object.values(status.queues)
  const sum = (pick: (q: (typeof queues)[number]) => number): number =>
    queues.reduce((total, q) => total + pick(q), 0)
  const state = (name: string) => sumQueueState(status, name)
  const at = now.toISOString()
  const oldest = Math.max(0, ...queues.map((q) => q.oldest_queued_s ?? 0))
  const queued = state('queued')
  const failed = state('failed')
  const oldestAt = new Date(now.getTime() - oldest * 1000).toISOString()
  return {
    health: { state: 'ok', reason: null },
    metrics: [
      { key: 'worker.queued', value: queued, at },
      {
        key: 'worker.live',
        value: state('leased') + state('running') + state('draining'),
        at,
      },
      { key: 'worker.failed', value: failed, at },
      { key: 'worker.done_1h', value: sum((q) => q.done_1h), at },
      { key: 'worker.wasted_1h_s', value: sum((q) => q.wasted_1h_s), at },
      {
        key: 'worker.cooldowns',
        value: Object.keys(status.cooldowns).length,
        at,
      },
      { key: 'worker.nodes', value: Object.keys(status.nodes).length, at },
    ],
    pending: workerPending(failed, queued, oldestAt),
  }
}
