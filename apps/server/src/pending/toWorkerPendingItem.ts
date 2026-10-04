import type { PendingView, WorkerJob } from '@orbit/contract'

export const toWorkerPendingItem = (
  job: WorkerJob | null,
  now: number,
): PendingView['items'][number] | null => {
  if (
    job === null ||
    job.state !== 'failed' ||
    job.acked !== null ||
    job.sampling
  )
    return null
  return {
    id: `worker:${job.id}`,
    source: 'worker',
    kind: 'worker',
    state: 'failed',
    title: job.id,
    detail: '',
    section: job.queue,
    ref: job.id,
    ageMs: Math.max(0, now - job.createdAt),
  }
}
