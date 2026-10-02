import type { BucketInput } from '../types/BucketInput'
import type { HistoryReadings } from '../types/HistoryReadings'
import { isCovered } from './isCovered'

export const missWindowFor = (
  history: HistoryReadings,
  runTimes: readonly number[],
  intervalMs: number | null,
  end: number,
): BucketInput['missWindow'] => {
  if (intervalMs === null) return null
  const start = end - 1.5 * intervalMs
  const baseline = history.observations.some(
    (o) => o.at <= start && o.runs !== null,
  )
  return {
    watched: baseline && isCovered(history.runs, start, end),
    ran: runTimes.some((at) => at >= start && at < end),
  }
}
