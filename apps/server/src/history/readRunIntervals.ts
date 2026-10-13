import type { DatabaseSync } from 'node:sqlite'
import type { RunInterval } from '../types/RunInterval'

export const readRunIntervals = (
  db: DatabaseSync,
  from: number,
): RunInterval[] =>
  db
    .prepare(
      'SELECT started, stopped FROM runs WHERE stopped >= ? ORDER BY started',
    )
    .all(from) as RunInterval[]
