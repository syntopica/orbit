import { openHistoryDb } from '../test/openHistoryDb'
import { measureDbBytes } from './measureDbBytes'

describe('measureDbBytes', () => {
  it('does not count free pages left by deletes', () => {
    const db = openHistoryDb()
    const insert = db.prepare(
      'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)',
    )
    for (let i = 0; i < 5000; i += 1)
      insert.run('worker', `key-${String(i)}`, i, i)
    const full = measureDbBytes(db)
    db.exec('DELETE FROM metric_samples')
    expect(measureDbBytes(db)).toBeLessThan(full / 2)
  })
})
