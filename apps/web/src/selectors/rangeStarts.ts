import { RANGE_SPECS } from '../heartbeat/rangeSpecs'
import type { HistoryRange } from '../types/HistoryRange'

// The System screen's buckets (spec 7.2), the newest ending at the server's now.
export const rangeStarts = (
  now: number,
  range: HistoryRange,
): { starts: number[]; bucketMs: number } => {
  const { spanMs, buckets } = RANGE_SPECS[range]
  const bucketMs = spanMs / buckets
  return {
    bucketMs,
    starts: Array.from(
      { length: buckets },
      (_, i) => now - spanMs + i * bucketMs,
    ),
  }
}
