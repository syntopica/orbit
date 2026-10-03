import type { WorkerActivity, WorkerActivityRow } from '@orbit/contract'

// 2026-09-21T13:46:40Z, a quarter to the hour; 24 hourly buckets back.
export const ACTIVITY_NOW = 1_790_000_000_000
export const HOUR = 3_600_000
export const LAST_BUCKET = Math.floor(ACTIVITY_NOW / HOUR) * HOUR

export const activityRow = (
  overrides: Partial<WorkerActivityRow> = {},
): WorkerActivityRow => ({
  bucket: LAST_BUCKET,
  queue: 'queue.a',
  provider: 'agy',
  sampling: false,
  outcome: 'succeeded',
  error: null,
  attempts: 1,
  wallMs: 1000,
  tokensIn: 10,
  tokensOut: 5,
  ...overrides,
})

export const workerActivity = (
  rows: readonly WorkerActivityRow[] = [],
  overrides: Partial<WorkerActivity> = {},
): WorkerActivity => ({
  now: ACTIVITY_NOW,
  since: ACTIVITY_NOW - 24 * HOUR,
  bucketMs: HOUR,
  rows: [...rows],
  ...overrides,
})
