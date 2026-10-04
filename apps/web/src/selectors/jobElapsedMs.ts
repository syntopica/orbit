import type { WorkerJob } from '@orbit/contract'

// How long a live job has been on its current attempt, from the attempt's
// start (or, from an older worker, the job's last update) to `now`.
export const jobElapsedMs = (
  job: Pick<WorkerJob, 'lastStartedAt' | 'updatedAt'>,
  now: number,
): number => Math.max(0, now - (job.lastStartedAt ?? job.updatedAt))
