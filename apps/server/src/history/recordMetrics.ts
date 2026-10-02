import type { Snapshot } from '@orbit/contract'
import type { DatabaseSync } from 'node:sqlite'

export const recordMetrics = (db: DatabaseSync, snapshot: Snapshot): void => {
  const last = db.prepare(
    'SELECT value FROM metric_samples WHERE component = ? AND key = ? ORDER BY at DESC LIMIT 1',
  )
  const insert = db.prepare(
    'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)',
  )
  for (const metric of snapshot.metrics) {
    const prior = last.get(snapshot.component, metric.key) as
      { value: number } | undefined
    if (prior?.value !== metric.value) {
      insert.run(
        snapshot.component,
        metric.key,
        metric.value,
        Date.parse(metric.at),
      )
    }
  }
}
