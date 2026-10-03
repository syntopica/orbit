import type { DatabaseSync } from 'node:sqlite'

import { AUDIT_LIMITS } from './auditLimits'

// Bounds the audit table by age and by row count, newest rows kept.
export const pruneAudit = (db: DatabaseSync, now: number): void => {
  db.prepare('DELETE FROM audit WHERE at < ?').run(now - AUDIT_LIMITS.maxAgeMs)
  db.prepare(
    'DELETE FROM audit WHERE rowid NOT IN (SELECT rowid FROM audit ORDER BY at DESC, rowid DESC LIMIT ?)',
  ).run(AUDIT_LIMITS.maxRows)
}
