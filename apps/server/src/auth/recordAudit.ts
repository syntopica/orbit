import type { DatabaseSync } from 'node:sqlite'

import { pruneAudit } from './pruneAudit'

export const recordAudit = (
  db: DatabaseSync,
  action: 'session.create' | 'session.pair' | 'session.logout',
  outcome: 'ok' | 'denied' | 'error',
  now: number,
): void => {
  db.prepare('INSERT INTO audit (at, action, outcome) VALUES (?, ?, ?)').run(
    now,
    action,
    outcome,
  )
  pruneAudit(db, now)
}
