import type { DatabaseSync } from 'node:sqlite'

import { AUTH_DURATIONS } from './authDurations'

export const pruneSessions = (db: DatabaseSync, now: number): void => {
  db.prepare('DELETE FROM sessions WHERE expires <= ? OR created + ? <= ?').run(
    now,
    AUTH_DURATIONS.sessionAbsoluteMs,
    now,
  )
}
