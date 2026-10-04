import type { z } from 'zod'

import type { WorkerJobDetail } from '@orbit/contract'
import type { workerAttemptReportSchema } from '../adapters/worker/workerAttemptReportSchema'
import { identifierOrNull } from './identifierOrNull'
import { isIdentifier } from './isIdentifier'
import { secondsToMs } from './secondsToMs'

export const toAttemptView = (
  row: z.infer<typeof workerAttemptReportSchema>,
): WorkerJobDetail['attemptDetails'][number] | null => {
  if (
    [row.node, row.provider, row.model, row.outcome].some(
      (value) => value !== null && !isIdentifier(value),
    )
  )
    return null
  return {
    node: row.node,
    provider: row.provider,
    model: row.model,
    outcome: row.outcome,
    error: identifierOrNull(row.error),
    startedAt: secondsToMs(row.started),
    endedAt: row.ended === null ? null : secondsToMs(row.ended),
    tokensIn: row.tokens_in,
    tokensOut: row.tokens_out,
  }
}
