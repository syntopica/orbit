import type { WorkerJobDetail } from '@orbit/contract'

import { formatAttemptTokens } from './formatAttemptTokens'
import { formatCostOrDash } from './formatCostOrDash'
import { formatWallTime } from './formatWallTime'

// What one attempt spent: tokens, run time as the executor measured it, cost.
export const formatAttemptUsage = (
  attempt: WorkerJobDetail['attemptDetails'][number],
): string =>
  `${formatAttemptTokens(attempt.tokensIn, attempt.tokensOut)} · ${formatWallTime(attempt.wallMs)} run · ${formatCostOrDash(attempt.costUsd)}`
