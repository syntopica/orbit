import type { WorkerFailure } from '@orbit/contract'

import type { WorkerStatus } from '../types/WorkerStatus'
import { compareFailures } from './compareFailures'
import { identifierOrNull } from './identifierOrNull'
import { isIdentifier } from './isIdentifier'

export const toFailureRows = (
  failures: WorkerStatus['recent_failures'],
): WorkerFailure[] =>
  failures
    .filter((f) => isIdentifier(f.id) && isIdentifier(f.queue))
    .map((f) => ({
      id: f.id,
      queue: f.queue,
      error: identifierOrNull(f.error),
      finishedAt: f.finished === null ? null : Math.round(f.finished * 1000),
    }))
    .toSorted(compareFailures)
    .slice(0, 50)
