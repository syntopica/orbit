import type { DatabaseSync } from 'node:sqlite'

import type { SessionSummary } from '../types/SessionSummary'

export const listSessions = (db: DatabaseSync): SessionSummary[] =>
  db
    .prepare(
      'SELECT substr(hash, 1, 8) AS prefix, created, last_seen AS lastSeen, expires FROM sessions ORDER BY created',
    )
    .all() as SessionSummary[]
