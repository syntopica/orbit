import type { WorkerQueue } from '@orbit/contract'
import type { QueueSplit } from '../types/QueueSplit'

// Queues with nothing queued and nothing failed fold away.
export const splitQueues = (queues: readonly WorkerQueue[]): QueueSplit => ({
  active: queues.filter((q) => q.queued > 0 || q.failed > 0),
  idle: queues.filter((q) => q.queued === 0 && q.failed === 0),
})
