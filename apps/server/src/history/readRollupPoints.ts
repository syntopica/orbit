import type { DatabaseSync } from 'node:sqlite'

import type { MetricRow } from '../types/MetricRow'

// Retained hourly maxima cover older ranges, including their value in force.
export const readRollupPoints = (
  db: DatabaseSync,
  component: string,
  from: number,
  to: number,
): MetricRow[] => {
  const firstHour = Math.ceil(Math.min(from, to) / 3_600_000)
  const baseline = db
    .prepare(
      'SELECT key, max(hour) * 3600000 AS at, "max" AS value FROM metric_rollups WHERE component = ? AND hour < ? GROUP BY key',
    )
    .all(component, firstHour) as MetricRow[]
  // Include the hour straddling retention: its earlier raw samples are pruned.
  const within = db
    .prepare(
      'SELECT key, hour * 3600000 AS at, "max" AS value FROM metric_rollups WHERE component = ? AND hour >= ? AND hour < ? ORDER BY hour',
    )
    .all(component, firstHour, Math.ceil(to / 3_600_000)) as MetricRow[]
  return [...baseline, ...within]
}
