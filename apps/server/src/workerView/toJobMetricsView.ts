import type { WorkerJobMetrics } from '../types/WorkerJobMetrics'
import type { WorkerJobReport } from '../types/WorkerJobReport'
import { amountOrNull } from './amountOrNull'
import { countOrNull } from './countOrNull'
import { identifierOrNull } from './identifierOrNull'
import { secondsToMsOrNull } from './secondsToMsOrNull'

// Every metric is secondary: one that fails its rule is blanked, never the row.
export const toJobMetricsView = (row: WorkerJobReport): WorkerJobMetrics => ({
  kind: identifierOrNull(row.kind),
  model: identifierOrNull(row.model),
  priority: countOrNull(row.priority),
  finishedAt: secondsToMsOrNull(row.finished),
  deadlineAt: secondsToMsOrNull(row.deadline),
  leaseNode: identifierOrNull(row.lease_node),
  leaseExpiresAt: secondsToMsOrNull(row.lease_expires),
  parentId: identifierOrNull(row.parent_id),
  preemptions: countOrNull(row.preemptions),
  tokensIn: countOrNull(row.tokens_in),
  tokensOut: countOrNull(row.tokens_out),
  costUsd: amountOrNull(row.cost_usd),
  wallMs: secondsToMsOrNull(row.wall_s),
  lastModel: identifierOrNull(row.last_model),
  lastProvider: identifierOrNull(row.last_provider),
  lastStartedAt: secondsToMsOrNull(row.last_started),
  lastOutcome: identifierOrNull(row.last_outcome),
})
