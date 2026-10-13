import type { DatabaseSync } from 'node:sqlite'

import type { ActionRun } from '../types/ActionRun'
import type { ActionRunRow } from '../types/ActionRunRow'

export const loadActionRuns = (db: DatabaseSync): ActionRun[] =>
  (
    db
      .prepare(
        `SELECT id, kind, target, state, started_at, exit_code, duration_ms
           FROM action_runs ORDER BY started_at DESC, id LIMIT 50`,
      )
      .all() as ActionRunRow[]
  ).map((row) => ({
    id: row.id,
    kind: row.kind,
    target: row.target,
    state: row.state,
    startedAt: row.started_at,
    exitCode: row.exit_code,
    durationMs: row.duration_ms,
  }))
