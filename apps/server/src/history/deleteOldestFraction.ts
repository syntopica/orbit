import type { DatabaseSync } from 'node:sqlite'

import type { ShrinkTarget } from '../types/ShrinkTarget'

// Table and column names come from the closed ShrinkTarget union, never from input.
export const deleteOldestFraction = (
  db: DatabaseSync,
  { table, column }: ShrinkTarget,
): boolean => {
  const row = db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as {
    n: number
  }
  if (row.n === 0) return false
  db.exec(
    `DELETE FROM ${table} WHERE rowid IN (SELECT rowid FROM ${table} ORDER BY ${column} LIMIT ${String(Math.floor(row.n / 10) + 1)})`,
  )
  return true
}
