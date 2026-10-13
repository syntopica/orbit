import type { DatabaseSync } from 'node:sqlite'

import type { LaunchdObservation } from '../types/LaunchdObservation'
import type { LaunchdObservationRow } from '../types/LaunchdObservationRow'

export const recordLaunchdObservation = (
  db: DatabaseSync,
  observation: LaunchdObservation,
): void => {
  const prior = db
    .prepare(
      'SELECT pid, runs, last_exit AS lastExit FROM launchd_observations WHERE label = ? ORDER BY at DESC, rowid DESC LIMIT 1',
    )
    .get(observation.label) as LaunchdObservationRow | undefined
  const unchanged =
    prior?.pid === observation.pid &&
    prior.runs === observation.runs &&
    prior.lastExit === observation.lastExit
  if (unchanged) return
  db.prepare(
    'INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, ?, ?, ?, ?)',
  ).run(
    observation.label,
    observation.pid,
    observation.runs,
    observation.lastExit,
    observation.at,
  )
}
