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
  db.prepare(
    `DELETE FROM launchd_observations WHERE at < ?
       AND at < (SELECT max(o.at) FROM launchd_observations o WHERE o.label = launchd_observations.label)`,
  ).run(now - 90 * dayMs)
  db.prepare('DELETE FROM metric_rollups WHERE hour < ?').run(
    Math.floor((now - 90 * dayMs) / hourMs),
  )
  db.prepare('DELETE FROM runs WHERE stopped < ?').run(now - 90 * dayMs)
  shrinkToCap(db, capBytes)
}
