import type { DatabaseSync } from 'node:sqlite'

// Observations are written on change; a run is an observation whose run
// count is above the one before it for the same label.
export const readLastRuns = (
  db: DatabaseSync,
  labels: readonly string[],
): Map<string, number> => {
  const statement = db.prepare(
    `SELECT max(at) AS at FROM (
       SELECT at, runs, lag(runs) OVER (ORDER BY at, rowid) AS prior
       FROM launchd_observations WHERE label = ?
     ) WHERE runs > prior`,
  )
  const runs = new Map<string, number>()
  for (const label of labels) {
    const row = statement.get(label) as { at: number | null } | undefined
    if (typeof row?.at === 'number') runs.set(label, row.at)
  }
  return runs
}
