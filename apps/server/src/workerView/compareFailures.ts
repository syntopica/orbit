import type { WorkerFailure } from '@orbit/contract'

// Newest first; a failure without a finish time sorts last.
export const compareFailures = (a: WorkerFailure, b: WorkerFailure): number =>
  (b.finishedAt ?? -Infinity) - (a.finishedAt ?? -Infinity) ||
  a.id.localeCompare(b.id)
