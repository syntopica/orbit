import type { DatabaseSync } from 'node:sqlite'

export const insertSample = (
  ...[db, component, key, value, at]: [
    db: DatabaseSync,
    component: string,
    key: string,
    value: number,
    at: number,
  ]
): void => {
  db.prepare(
    'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)',
  ).run(component, key, value, at)
}
