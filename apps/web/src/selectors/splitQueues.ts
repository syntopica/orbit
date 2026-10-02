import type { WorkerQueue } from '@orbit/contract'

// Queues with nothing queued and nothing failed fold away.
export const splitQueues = (
  queues: readonly WorkerQueue[],
): { active: WorkerQueue[]; idle: WorkerQueue[] } => ({
  active: queues.filter((q) => q.queued > 0 || q.failed > 0),
  idle: queues.filter((q) => q.queued === 0 && q.failed === 0),
})
