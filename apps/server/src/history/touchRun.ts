import type { DatabaseSync } from 'node:sqlite'

export const touchRun = (
  db: DatabaseSync,
  started: number,
  now: number,
): void => {
  db.prepare('UPDATE runs SET stopped = ? WHERE started = ?').run(now, started)
}
