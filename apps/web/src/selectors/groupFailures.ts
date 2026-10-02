import type { WorkerFailure } from '@orbit/contract'

import type { FailureGroup } from '../types/FailureGroup'

// Consecutive failures of one queue with one error read as one row.
export const groupFailures = (
  failures: readonly WorkerFailure[],
): FailureGroup[] =>
  failures.reduce<FailureGroup[]>((groups, failure) => {
    const last = groups.at(-1)
    if (
      last?.latest.queue === failure.queue &&
      last.latest.error === failure.error
    ) {
      return [...groups.slice(0, -1), { ...last, count: last.count + 1 }]
    }
    return [...groups, { latest: failure, count: 1 }]
  }, [])
