import type { DatabaseSync } from 'node:sqlite'

import type { ShrinkTarget } from '../types/ShrinkTarget'
import { deleteOldestFraction } from './deleteOldestFraction'
import { measureDbBytes } from './measureDbBytes'

export const shrinkToCap = (db: DatabaseSync, capBytes: number): void => {
  // Each label's latest observation is its baseline and is never a candidate.
  const order: readonly ShrinkTarget[] = [
    { table: 'metric_samples', column: 'at', candidates: '1 = 1' },
    {
      table: 'launchd_observations',
      column: 'at',
      candidates:
        'rowid NOT IN (SELECT rowid FROM (SELECT rowid, row_number() OVER (PARTITION BY label ORDER BY at DESC, rowid DESC) AS rn FROM launchd_observations) WHERE rn = 1)',
    },
    { table: 'metric_rollups', column: 'hour', candidates: '1 = 1' },
  ]
  // Deleting frees pages that the measure already excludes, so the file is
  // vacuumed once at the end rather than after every round.
  let deletedAny = false
  for (let round = 0; round < 1_000; round += 1) {
    if (measureDbBytes(db) <= capBytes) break
    const deleted = order.some((target) => deleteOldestFraction(db, target))
    if (!deleted) break
    deletedAny = true
  }
  if (!deletedAny) return
  try {
    db.exec('VACUUM')
  } catch {
    // Another connection holds the file; the next prune vacuums again.
  }
}
