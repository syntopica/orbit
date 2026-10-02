import type { DatabaseSync } from 'node:sqlite'

import { AUTH_DURATIONS } from './authDurations'
import { hashSecret } from './hashSecret'

export const touchSession = (
  db: DatabaseSync,
  id: string,
  now: number,
): boolean => {
  const hash = hashSecret(id)
  const row = db
    .prepare('SELECT created, expires FROM sessions WHERE hash = ?')
    .get(hash) as { created: number; expires: number } | undefined
  if (row === undefined) return false
  const absolute = row.created + AUTH_DURATIONS.sessionAbsoluteMs
  if (row.expires <= now || absolute <= now) {
    db.prepare('DELETE FROM sessions WHERE hash = ?').run(hash)
    return false
  }
  db.prepare(
    'UPDATE sessions SET last_seen = ?, expires = ? WHERE hash = ?',
  ).run(now, Math.min(now + AUTH_DURATIONS.sessionSlidingMs, absolute), hash)
  return true
}
