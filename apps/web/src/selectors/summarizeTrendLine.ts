import type { TrendLineSummary } from '../types/TrendLineSummary'

// The newest reading and how far it moved since the first reading in range;
// buckets with no reading are skipped, and a line with none has no summary.
export const summarizeTrendLine = (
  values: readonly (number | null)[],
): TrendLineSummary | null => {
  const readings = values.filter((value): value is number => value !== null)
  const first = readings[0]
  const latest = readings.at(-1)
  if (first === undefined || latest === undefined) return null
  return { latest, change: latest - first }
}
