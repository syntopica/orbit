import type { DatabaseSync } from 'node:sqlite'

export const readRunIntervals = (
  db: DatabaseSync,
  from: number,
): { started: number; stopped: number }[] =>
  db
    .prepare(
      'SELECT started, stopped FROM runs WHERE stopped >= ? ORDER BY started',
    )
    .all(from) as { started: number; stopped: number }[]
