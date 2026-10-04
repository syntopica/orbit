import type { DatabaseSync } from 'node:sqlite'

import type { ActionRun } from '../types/ActionRun'

export const loadActionRuns = (db: DatabaseSync): ActionRun[] =>
  (
    db
      .prepare(
        `SELECT id, kind, target, state, started_at, exit_code, duration_ms
           FROM action_runs ORDER BY started_at DESC, id LIMIT 50`,
      )
      .all() as {
      id: string
      kind: string
      target: string
      state: ActionRun['state']
      started_at: number
      exit_code: number
      duration_ms: number
    }[]
  ).map((row) => ({
    id: row.id,
    kind: row.kind,
    target: row.target,
    state: row.state,
    startedAt: row.started_at,
    exitCode: row.exit_code,
    durationMs: row.duration_ms,
  }))
