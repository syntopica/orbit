import type { Pending } from '@orbit/contract'

export const workerPending = (
  failed: number,
  queued: number,
  oldestAt: string,
): Pending[] => [
  ...(failed > 0
    ? [{ key: 'worker.failed_jobs' as const, count: failed, oldestAt: null }]
    : []),
  ...(queued > 0
    ? [{ key: 'worker.queued_jobs' as const, count: queued, oldestAt }]
    : []),
]
