import { METRIC_KEYS, type MetricHistory } from '@orbit/contract'
import { z } from 'zod'

import type { MetricRow } from '../types/MetricRow'

// One series per known key, points in time order; retired keys are dropped.
export const groupSeries = (
  rows: readonly MetricRow[],
  from: number,
): MetricHistory['series'] => {
  const keySchema = z.enum(METRIC_KEYS)
  const byKey = new Map<MetricHistory['series'][number]['key'], MetricRow[]>()
  for (const row of rows) {
    const key = keySchema.safeParse(row.key)
    if (!key.success) continue
    byKey.set(key.data, [...(byKey.get(key.data) ?? []), row])
  }
  return [...byKey].map(([key, points]) => {
    const ordered = points.toSorted((a, b) => a.at - b.at)
    return {
      key,
      points: ordered
        .filter(
          (point, index) =>
            point.at >= from || (ordered[index + 1]?.at ?? from) >= from,
        )
        .map(({ at, value }) => ({ at, value })),
    }
  })
}
