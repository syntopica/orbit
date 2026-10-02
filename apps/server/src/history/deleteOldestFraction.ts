import type { DatabaseSync } from 'node:sqlite'

import type { ShrinkTarget } from '../types/ShrinkTarget'

// Table, column and candidate predicate come from constant ShrinkTarget values, never from input.
export const deleteOldestFraction = (
  db: DatabaseSync,
  { table, column, candidates }: ShrinkTarget,
): boolean => {
  const row = db
    .prepare(`SELECT count(*) AS n FROM ${table} WHERE ${candidates}`)
    .get() as { n: number }
  if (row.n === 0) return false
  db.exec(
    `DELETE FROM ${table} WHERE rowid IN (SELECT rowid FROM ${table} WHERE ${candidates} ORDER BY ${column} LIMIT ${String(Math.floor(row.n / 10) + 1)})`,
  )
  return true
}
