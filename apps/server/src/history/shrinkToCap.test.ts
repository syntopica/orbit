import { interceptExec } from '../test/interceptExec'
import { openHistoryDb } from '../test/openHistoryDb'
import { shrinkToCap } from './shrinkToCap'

const count = (db: ReturnType<typeof openHistoryDb>, table: string): number =>
  (db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n

describe('shrinkToCap', () => {
  it('keeps exactly one latest observation per label, even on equal timestamps', () => {
    const db = openHistoryDb()
    const insert = db.prepare(
      'INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, ?, ?, ?, ?)',
    )
    for (const run of [1, 2, 3]) insert.run('a', null, run, 0, 100)
    insert.run('a', null, 4, 0, 50)
    insert.run('b', null, 1, 0, 10)
    shrinkToCap(db, 1)
    expect(
      db
        .prepare('SELECT label, runs FROM launchd_observations ORDER BY label')
        .all(),
    ).toEqual([
      { label: 'a', runs: 3 },
      { label: 'b', runs: 1 },
    ])
  })

  it('does nothing while the file fits the cap', () => {
    const db = openHistoryDb()
    db.prepare(
      'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)',
    ).run('w', 'k', 1, 1)
    shrinkToCap(db, 10 * 1024 * 1024)
    expect(count(db, 'metric_samples')).toBe(1)
  })

  it('stops quietly when VACUUM fails, keeping what it already deleted', () => {
    const db = openHistoryDb()
    const insert = db.prepare(
      'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)',
    )
    for (let i = 0; i < 500; i += 1) insert.run('w', 'k', i, i)
    const failing = interceptExec(db, (sql) => {
      if (sql === 'VACUUM') throw new Error('database is locked')
    })
    expect(() => {
      shrinkToCap(failing, 1)
    }).not.toThrow()
    expect(count(db, 'metric_samples')).toBe(449)
  })

  it('stops without vacuuming when only baselines are left', () => {
    const db = openHistoryDb()
    db.prepare(
      'INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, ?, ?, ?, ?)',
    ).run('a', null, 1, 0, 1)
    const vacuums: string[] = []
    shrinkToCap(
      interceptExec(db, (sql) => {
        if (sql === 'VACUUM') vacuums.push(sql)
      }),
      1,
    )
    expect(vacuums).toEqual([])
    expect(count(db, 'launchd_observations')).toBe(1)
  })
})
