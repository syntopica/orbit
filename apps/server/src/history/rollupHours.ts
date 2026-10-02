import type { DatabaseSync } from 'node:sqlite'

export const rollupHours = (db: DatabaseSync, now: number): void => {
  const hourMs = 3_600_000
  const currentHour = Math.floor(now / hourMs)
  db.prepare(
    `INSERT INTO metric_rollups (component, key, hour, min, max, sum, count)
     SELECT component, key, CAST(at / ? AS INTEGER) AS hour, min(value), max(value), sum(value), count(*)
     FROM metric_samples WHERE at >= ? AND at < ? GROUP BY component, key, hour
     ON CONFLICT (component, key, hour) DO UPDATE SET
       min = excluded.min, max = excluded.max, sum = excluded.sum, count = excluded.count`,
  ).run(hourMs, (currentHour - 2) * hourMs, currentHour * hourMs)
}
