import type { WorkerJob } from '@orbit/contract'

// The part of a job row that came with the worker's job metrics.
export type WorkerJobMetrics = Pick<
  WorkerJob,
  | 'kind'
  | 'model'
  | 'priority'
  | 'finishedAt'
  | 'deadlineAt'
  | 'leaseNode'
  | 'leaseExpiresAt'
  | 'parentId'
  | 'preemptions'
  | 'tokensIn'
  | 'tokensOut'
  | 'costUsd'
  | 'wallMs'
  | 'lastModel'
  | 'lastProvider'
  | 'lastStartedAt'
  | 'lastOutcome'
>
