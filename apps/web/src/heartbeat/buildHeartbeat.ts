import type { Bucket } from '../types/Bucket'
import type { HistoryRange } from '../types/HistoryRange'
import type { HistoryReadings } from '../types/HistoryReadings'
import type { LaunchdRow } from '../types/LaunchdRow'
import { classifyBucket } from './classifyBucket'
import { isCovered } from './isCovered'
import { listRunTimes } from './listRunTimes'
import { missWindowFor } from './missWindowFor'
import { RANGE_SPECS } from './rangeSpecs'

export const buildHeartbeat = (
  history: HistoryReadings,
  row: LaunchdRow,
  range: HistoryRange,
  now: number,
): Bucket[] => {
  const { spanMs, buckets } = RANGE_SPECS[range]
  const width = spanMs / buckets
  const first = now - spanMs
  const runTimes = listRunTimes(history.observations)
  const intervalS = row.schedule?.intervalS ?? null
  const intervalMs = intervalS === null ? null : intervalS * 1000
  return Array.from({ length: buckets }, (_, index) => {
    const start = first + index * width
    const end = start + width
    const state = classifyBucket({
      covered: isCovered(history.runs, start, end),
      role: row.role,
      intervalMs,
      inBucket: history.observations.filter((o) => o.at >= start && o.at < end),
      atEnd: history.observations.findLast((o) => o.at < end) ?? null,
      runInBucket: runTimes.some((at) => at >= start && at < end),
      missWindow: missWindowFor(history, runTimes, intervalMs, end),
    })
    return { start, end, state }
  })
}
