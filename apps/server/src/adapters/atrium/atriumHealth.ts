import type { SnapshotCore } from '@orbit/contract'

import type { AtriumDocuments } from '../../types/AtriumDocuments'

// Stale refresh first; otherwise a broken doctor check warns. A `warn`
// finding is drift atrium still answers through, so it does not.
export const atriumHealth = (
  writtenAt: string,
  refreshIntervalMs: number,
  now: Date,
  doctor: AtriumDocuments['doctor'] = null,
): SnapshotCore['health'] => {
  if (now.getTime() - Date.parse(writtenAt) > 2 * refreshIntervalMs)
    return { state: 'warn', reason: 'stale' }
  if (doctor?.checks.some((check) => check.severity === 'broken') === true)
    return { state: 'warn', reason: 'check_failed' }
  return { state: 'ok', reason: null }
}
