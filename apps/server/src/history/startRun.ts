import type { DatabaseSync } from 'node:sqlite'

export const startRun = (db: DatabaseSync, now: number): number => {
  db.prepare(
    'INSERT OR REPLACE INTO runs (started, stopped) VALUES (?, ?)',
  ).run(now, now)
  return now
}
