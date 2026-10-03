import type { DatabaseSync } from 'node:sqlite'

import { rollupHours } from './rollupHours'
import { shrinkToCap } from './shrinkToCap'

export const pruneHistory = (
  db: DatabaseSync,
  now: number,
  capBytes = 200 * 1024 * 1024,
): void => {
  const hourMs = 3_600_000
  const dayMs = 24 * hourMs
  rollupHours(db, now)
  db.prepare('DELETE FROM metric_samples WHERE at < ?').run(now - 7 * dayMs)
  // Per label, the newest observation at or before the cutoff stays: it is the
  // baseline a missed-run window starting at the cutoff compares against.
  db.prepare(
    `DELETE FROM launchd_observations WHERE at < ?1
       AND rowid NOT IN (SELECT rowid FROM (SELECT rowid, row_number() OVER (PARTITION BY label ORDER BY at DESC, rowid DESC) AS rn FROM launchd_observations WHERE at <= ?1) WHERE rn = 1)`,
  ).run(now - 90 * dayMs)
  db.prepare('DELETE FROM metric_rollups WHERE hour < ?').run(
    Math.floor((now - 90 * dayMs) / hourMs),
  )
  db.prepare('DELETE FROM runs WHERE stopped < ?').run(now - 90 * dayMs)
  shrinkToCap(db, capBytes)
}
