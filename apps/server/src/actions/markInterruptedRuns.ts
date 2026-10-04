import type { DatabaseSync } from 'node:sqlite'

// Run once when the server starts: a run still `started` belonged to the
// previous process, which can no longer report its outcome.
export const markInterruptedRuns = (db: DatabaseSync): void => {
  db.prepare(
    "UPDATE action_runs SET state = 'interrupted' WHERE state = 'started'",
  ).run()
}
