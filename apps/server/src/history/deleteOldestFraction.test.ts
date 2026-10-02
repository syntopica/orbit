import { openHistoryDb } from '../test/openHistoryDb'
import { deleteOldestFraction } from './deleteOldestFraction'

describe('deleteOldestFraction', () => {
  it('deletes a tenth plus one of the oldest rows and reports it', () => {
    const db = openHistoryDb()
    const insert = db.prepare(
      'INSERT INTO metric_rollups (component, key, hour, min, max, sum, count) VALUES (?, ?, ?, 1, 1, 1, 1)',
    )
    for (let hour = 20; hour >= 1; hour -= 1) insert.run('w', 'k', hour)
    expect(
      deleteOldestFraction(db, {
        table: 'metric_rollups',
        column: 'hour',
        candidates: '1 = 1',
      }),
    ).toBe(true)
    const left = (
      db.prepare('SELECT hour FROM metric_rollups ORDER BY hour').all() as {
        hour: number
      }[]
    ).map((r) => r.hour)
    expect(left).toEqual(Array.from({ length: 17 }, (_, i) => i + 4))
  })

  it('reports false and changes nothing for an empty table', () => {
    const db = openHistoryDb()
    expect(
      deleteOldestFraction(db, {
        table: 'metric_samples',
        column: 'at',
        candidates: '1 = 1',
      }),
    ).toBe(false)
  })
})
