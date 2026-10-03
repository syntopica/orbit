import { formatAxisTime } from '../formatters/formatAxisTime'
import type { AxisTick } from '../types/AxisTick'
import { localPeriod } from './localPeriod'

// A label where a local 6-hour period (hourly buckets) or a local day
// (coarser buckets) begins, at that column's centre.
export const xAxisTicks = (
  starts: readonly number[],
  centers: readonly number[],
  bucketMs: number,
): AxisTick[] => {
  const periodMs = bucketMs < 21_600_000 ? 21_600_000 : 86_400_000
  return starts.flatMap((start, i) => {
    const previous = starts[i - 1]
    const begins =
      previous !== undefined &&
      localPeriod(start, periodMs) !== localPeriod(previous, periodMs)
    return begins
      ? [{ at: centers[i] ?? 0, label: formatAxisTime(start, bucketMs) }]
      : []
  })
}
