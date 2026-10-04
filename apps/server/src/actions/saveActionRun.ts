import type { DatabaseSync } from 'node:sqlite'

import type { ActionRun } from '../types/ActionRun'

// Upserts one run and keeps the newest 50, the same window `GET /api/actions`
// lists.
export const saveActionRun = (db: DatabaseSync, run: ActionRun): void => {
  db.prepare(
    `INSERT INTO action_runs
       (id, kind, target, state, started_at, exit_code, duration_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       state = excluded.state,
       exit_code = excluded.exit_code,
       duration_ms = excluded.duration_ms`,
  ).run(
    run.id,
    run.kind,
    run.target,
    run.state,
    run.startedAt,
    run.exitCode,
    run.durationMs,
  )
  db.prepare(
    `DELETE FROM action_runs WHERE id NOT IN
       (SELECT id FROM action_runs ORDER BY started_at DESC, id LIMIT 50)`,
  ).run()
}
