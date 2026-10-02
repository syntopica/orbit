import type { DatabaseSync } from 'node:sqlite'

import type { LaunchdHistory } from '../types/LaunchdHistory'
import type { LaunchdObservation } from '../types/LaunchdObservation'

export const readLaunchdHistory = (
  db: DatabaseSync,
  label: string,
  from: number,
): LaunchdHistory => {
  const columns = 'label, pid, runs, last_exit AS lastExit, at'
  const before = db
    .prepare(
      `SELECT ${columns} FROM launchd_observations WHERE label = ? AND at < ? ORDER BY at DESC LIMIT 1`,
    )
    .all(label, from) as LaunchdObservation[]
  const within = db
    .prepare(
      `SELECT ${columns} FROM launchd_observations WHERE label = ? AND at >= ? ORDER BY at`,
    )
    .all(label, from) as LaunchdObservation[]
  const runs = db
    .prepare(
      'SELECT started, stopped FROM runs WHERE stopped >= ? ORDER BY started',
    )
    .all(from) as LaunchdHistory['runs']
  return { observations: [...before, ...within], runs }
}
