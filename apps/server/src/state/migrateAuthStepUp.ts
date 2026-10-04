import type { DatabaseSync } from 'node:sqlite'

// Additive migration for auth stores created before job content reveal.
export const migrateAuthStepUp = (db: DatabaseSync): void => {
  const columns = db.prepare('PRAGMA table_info(sessions)').all() as {
    name: string
  }[]
  if (columns.some((column) => column.name === 'step_up_at')) return
  db.exec('ALTER TABLE sessions ADD COLUMN step_up_at INTEGER')
}
