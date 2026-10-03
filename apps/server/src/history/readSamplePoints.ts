import type { DatabaseSync } from 'node:sqlite'

import type { MetricRow } from '../types/MetricRow'

// Samples are stored on change, so each key's newest sample before `from` is
// the value still in force at `from` and is returned as its first point.
// SQLite takes the bare `value` from the row holding max(at).
export const readSamplePoints = (
  db: DatabaseSync,
  component: string,
  from: number,
): MetricRow[] => {
  const baseline = db
    .prepare(
      'SELECT key, max(at) AS at, value FROM metric_samples WHERE component = ? AND at < ? GROUP BY key',
    )
    .all(component, from) as MetricRow[]
  const within = db
    .prepare(
      'SELECT key, at, value FROM metric_samples WHERE component = ? AND at >= ? ORDER BY at, rowid',
    )
    .all(component, from) as MetricRow[]
  return [...baseline, ...within]
}
