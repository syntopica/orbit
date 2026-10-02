import type { WorkerQueue } from '@orbit/contract'

export const compareQueues = (a: WorkerQueue, b: WorkerQueue): number =>
  b.queued - a.queued || b.failed - a.failed || a.name.localeCompare(b.name)
