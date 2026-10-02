import type { DatabaseSync } from 'node:sqlite'

import { AUTH_DURATIONS } from './authDurations'
import { hashSecret } from './hashSecret'
import { pruneSessions } from './pruneSessions'
import { randomToken } from './randomToken'

export const createSession = (db: DatabaseSync, now: number): string => {
  pruneSessions(db, now)
  const id = randomToken(32)
  db.prepare(
    'INSERT INTO sessions (hash, created, last_seen, expires) VALUES (?, ?, ?, ?)',
  ).run(hashSecret(id), now, now, now + AUTH_DURATIONS.sessionSlidingMs)
  return id
}
