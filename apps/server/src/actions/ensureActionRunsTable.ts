import type { DatabaseSync } from 'node:sqlite'

// Action outcomes outlive a restart: one content-free row per run, created on
// first use so stores made before actions existed need no migration step.
export const ensureActionRunsTable = (db: DatabaseSync): void => {
  db.exec(`CREATE TABLE IF NOT EXISTS action_runs (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    target TEXT NOT NULL,
    state TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    exit_code INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL
  ) STRICT;
  CREATE INDEX IF NOT EXISTS action_runs_started ON action_runs (started_at)`)
}
