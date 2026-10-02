import type { DatabaseSync } from 'node:sqlite'

import type { ShrinkTarget } from '../types/ShrinkTarget'
import { deleteOldestFraction } from './deleteOldestFraction'
import { measureDbBytes } from './measureDbBytes'

export const shrinkToCap = (db: DatabaseSync, capBytes: number): void => {
  const order: readonly ShrinkTarget[] = [
    { table: 'metric_samples', column: 'at' },
    { table: 'launchd_observations', column: 'at' },
    { table: 'metric_rollups', column: 'hour' },
  ]
  while (measureDbBytes(db) > capBytes) {
    const deleted = order.some((target) => deleteOldestFraction(db, target))
    if (!deleted) return
    db.exec('VACUUM')
  }
}
