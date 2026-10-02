import type { DatabaseSync } from 'node:sqlite'

import { AUTH_DURATIONS } from './authDurations'
import { hashSecret } from './hashSecret'
import { pruneSessions } from './pruneSessions'

export const touchSession = (
  db: DatabaseSync,
  id: string,
  now: number,
): boolean => {
  pruneSessions(db, now)
  const { sessionAbsoluteMs, sessionSlidingMs } = AUTH_DURATIONS
  const result = db
    .prepare(
      'UPDATE sessions SET last_seen = ?, expires = MIN(? , created + ?) WHERE hash = ? AND expires > ? AND created + ? > ?',
    )
    .run(
      now,
      now + sessionSlidingMs,
      sessionAbsoluteMs,
      hashSecret(id),
      now,
      sessionAbsoluteMs,
      now,
    )
  return Number(result.changes) > 0
}
