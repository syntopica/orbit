import type { WorkerQualityAttempt } from '@orbit/contract'

import type { WorkerQualityReport } from '../types/WorkerQualityReport'
import { identifierOrNull } from './identifierOrNull'
import { isIdentifier } from './isIdentifier'
import { secondsToMs } from './secondsToMs'

export const toQualityAttempts = (
  rows: WorkerQualityReport['attempts'],
): WorkerQualityAttempt[] =>
  rows
    .filter(
      (row) =>
        isIdentifier(row.queue) &&
        isIdentifier(row.provider) &&
        isIdentifier(row.model),
    )
    .map((row) => ({
      queue: row.queue,
      tier: identifierOrNull(row.tier),
      provider: row.provider,
      model: row.model,
      attempts: row.attempts,
      succeeded: row.succeeded,
      schemaViolations: row.schema_violations,
      failed: row.failed,
      preempted: row.preempted,
      meanWallMs:
        row.mean_wall_s === null ? null : secondsToMs(row.mean_wall_s),
    }))
