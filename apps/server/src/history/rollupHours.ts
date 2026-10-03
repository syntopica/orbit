import type { DatabaseSync } from 'node:sqlite'

// Rolls up every complete hour since the newest rollup (at least the last
// two, or every sample when none exists), so hours left unrolled while the
// machine slept are filled on wake.
export const rollupHours = (db: DatabaseSync, now: number): void => {
  const hourMs = 3_600_000
  const currentHour = Math.floor(now / hourMs)
  const newest = db
    .prepare('SELECT max(hour) AS hour FROM metric_rollups')
    .get() as { hour: number | null }
  const fromHour =
    newest.hour === null ? 0 : Math.min(currentHour - 2, newest.hour)
  db.prepare(
    `INSERT INTO metric_rollups (component, key, hour, min, max, sum, count)
     SELECT component, key, CAST(at / ? AS INTEGER) AS hour, min(value), max(value), sum(value), count(*)
     FROM metric_samples WHERE at >= ? AND at < ? GROUP BY component, key, hour
     ON CONFLICT (component, key, hour) DO UPDATE SET
       min = excluded.min, max = excluded.max, sum = excluded.sum, count = excluded.count`,
  ).run(hourMs, fromHour * hourMs, currentHour * hourMs)
}
