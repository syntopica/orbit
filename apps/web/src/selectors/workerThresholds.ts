export const WORKER_THRESHOLDS = {
  // A node reports every few seconds; five minutes of silence means it is gone.
  staleReportMs: 5 * 60_000,
  // The worker's default idle threshold: below it, idle-only work waits.
  inUseIdleMs: 5 * 60_000,
} as const
