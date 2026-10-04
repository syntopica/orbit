import type { WorkerJob } from '@orbit/contract'

// Whether any listed job has a cost on record; free and local models leave
// it empty, and a column of dashes only crowds the rest.
export const hasJobCost = (
  jobs: readonly Pick<WorkerJob, 'costUsd'>[],
): boolean => jobs.some((job) => job.costUsd !== null)
