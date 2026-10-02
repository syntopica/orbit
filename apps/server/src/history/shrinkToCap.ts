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
  for (let round = 0; round < 1_000; round += 1) {
    if (measureDbBytes(db) <= capBytes) return
    const deleted = order.some((target) => deleteOldestFraction(db, target))
    if (!deleted) return
    try {
      db.exec('VACUUM')
    } catch {
      // Another connection holds the file; stop and let the next prune retry.
      return
    }
  }
}
