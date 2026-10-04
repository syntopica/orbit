import type { WorkerJob } from '@orbit/contract'

import type { WorkerJobReport } from '../types/WorkerJobReport'
import { identifierOrNull } from './identifierOrNull'
import { isIdentifier } from './isIdentifier'
import { secondsToMs } from './secondsToMs'
import { toJobMetricsView } from './toJobMetricsView'

export const toJobView = (row: WorkerJobReport): WorkerJob | null => {
  if (
    !isIdentifier(row.id) ||
    !isIdentifier(row.queue) ||
    !isIdentifier(row.producer) ||
    !isIdentifier(row.state) ||
    !isIdentifier(row.tier)
  )
    return null
  return {
    id: row.id,
    queue: row.queue,
    producer: row.producer,
    state: row.state,
    privacy: row.privacy,
    tier: row.tier,
    createdAt: secondsToMs(row.created),
    updatedAt: secondsToMs(row.updated),
    attempts: row.attempts,
    lastError: identifierOrNull(row.last_error),
    acked: row.acked === null ? null : secondsToMs(row.acked),
    retryOf: identifierOrNull(row.retry_of),
    sampling: row.sampling,
    ...toJobMetricsView(row),
  }
}
