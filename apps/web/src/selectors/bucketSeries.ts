import type { MetricHistory } from '@orbit/contract'

import { isCovered } from '../heartbeat/isCovered'

// Samples are stored on change, so a bucket reads the value in force at its
// end; a bucket orbit did not watch whole is a gap (spec 5.7, 7.4).
export const bucketSeries = (
  points: MetricHistory['series'][number]['points'],
  runs: MetricHistory['runs'],
  starts: readonly number[],
  bucketMs: number,
): (number | null)[] =>
  starts.map((start) => {
    const end = start + bucketMs
    if (!isCovered(runs, start, end)) return null
    return points.findLast((point) => point.at < end)?.value ?? null
  })
