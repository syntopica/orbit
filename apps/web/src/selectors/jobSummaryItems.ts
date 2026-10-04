import type { WorkerJob } from '@orbit/contract'

import { formatAttemptTokens } from '../formatters/formatAttemptTokens'
import { formatCostOrDash } from '../formatters/formatCostOrDash'
import { formatTimeOrDash } from '../formatters/formatTimeOrDash'
import { formatWallTime } from '../formatters/formatWallTime'
import type { LabelledValue } from '../types/LabelledValue'

// A job's metadata beyond its header line; totals sum the settled attempts.
export const jobSummaryItems = (job: WorkerJob): LabelledValue[] => [
  { label: 'Kind', value: job.kind ?? '—' },
  { label: 'Requested model', value: job.model ?? '—' },
  { label: 'Latest model', value: job.lastModel ?? '—' },
  { label: 'Priority', value: String(job.priority ?? '—') },
  { label: 'Node', value: job.leaseNode ?? '—' },
  { label: 'Lease expires', value: formatTimeOrDash(job.leaseExpiresAt) },
  { label: 'Deadline', value: formatTimeOrDash(job.deadlineAt) },
  { label: 'Finished', value: formatTimeOrDash(job.finishedAt) },
  { label: 'Preemptions', value: String(job.preemptions ?? '—') },
  { label: 'Parent job', value: job.parentId ?? '—' },
  {
    label: 'Tokens',
    value: formatAttemptTokens(job.tokensIn, job.tokensOut),
  },
  { label: 'Cost', value: formatCostOrDash(job.costUsd) },
  { label: 'Run time', value: formatWallTime(job.wallMs) },
]
