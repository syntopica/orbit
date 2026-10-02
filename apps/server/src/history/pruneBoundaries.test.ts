import { openHistoryDb } from '../test/openHistoryDb'
import { pruneHistory } from './pruneHistory'

const insertSampleSql =
  'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)'
const hour = 3_600_000
const day = 24 * hour
const now = 200 * day

const column = (db: ReturnType<typeof openHistoryDb>, sql: string): number[] =>
  (db.prepare(sql).all() as { v: number }[]).map((r) => r.v)

describe('pruneHistory boundaries', () => {
  it('keeps a metric sample exactly 7 days old and drops one a millisecond older', () => {
    const db = openHistoryDb()
    const insert = db.prepare(insertSampleSql)
    insert.run('w', 'k', 1, now - 7 * day)
    insert.run('w', 'k', 2, now - 7 * day - 1)
    pruneHistory(db, now)
    expect(column(db, 'SELECT value AS v FROM metric_samples')).toEqual([1])
  })

  it('keeps a launchd observation exactly 90 days old, drops one older, keeps each label latest', () => {
    const db = openHistoryDb()
    const insert = db.prepare(
      'INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, ?, ?, ?, ?)',
    )
    insert.run('a', null, 1, 0, now - 90 * day - 1)
    insert.run('a', null, 2, 0, now - 90 * day)
    insert.run('a', null, 3, 0, now - day)
    insert.run('b', null, 1, 0, now - 200 * day + 1)
    pruneHistory(db, now)
    expect(
      db
        .prepare(
          'SELECT label, runs FROM launchd_observations ORDER BY label, runs',
        )
        .all(),
    ).toEqual([
      { label: 'a', runs: 2 },
      { label: 'a', runs: 3 },
      { label: 'b', runs: 1 },
    ])
  })

  it('keeps a run that stopped exactly 90 days ago and drops one older', () => {
    const db = openHistoryDb()
    const insert = db.prepare(
      'INSERT INTO runs (started, stopped) VALUES (?, ?)',
    )
    insert.run(1, now - 90 * day)
    insert.run(2, now - 90 * day - 1)
    pruneHistory(db, now)
    expect(column(db, 'SELECT started AS v FROM runs')).toEqual([1])
  })

  it('keeps the rollup of the cutoff hour and drops the one before it', () => {
    const db = openHistoryDb()
    const cutoffHour = Math.floor((now - 90 * day) / hour)
    const insert = db.prepare(
      'INSERT INTO metric_rollups (component, key, hour, min, max, sum, count) VALUES (?, ?, ?, 1, 1, 1, 1)',
    )
    insert.run('w', 'k', cutoffHour)
    insert.run('w', 'k', cutoffHour - 1)
    pruneHistory(db, now)
    expect(column(db, 'SELECT hour AS v FROM metric_rollups')).toEqual([
      cutoffHour,
    ])
  })

  it('rolls up only the two last complete hours', () => {
    const db = openHistoryDb()
    const current = Math.floor(now / hour)
    const insert = db.prepare(insertSampleSql)
    insert.run('w', 'k', 1, (current - 3) * hour + hour - 1)
    insert.run('w', 'k', 1, (current - 2) * hour)
    insert.run('w', 'k', 1, current * hour - 1)
    insert.run('w', 'k', 1, current * hour)
    pruneHistory(db, now)
    expect(
      column(db, 'SELECT hour AS v FROM metric_rollups ORDER BY hour'),
    ).toEqual([current - 2, current - 1])
  })

  it('refreshes a rollup when its samples change between runs', () => {
    const db = openHistoryDb()
    const at = Math.floor(now / hour) * hour - hour
    db.prepare(insertSampleSql).run('w', 'k', 5, at)
    pruneHistory(db, now)
    db.prepare(insertSampleSql).run('w', 'k', 1, at + 1)
    pruneHistory(db, now)
    expect(
      db.prepare('SELECT min, max, sum, count FROM metric_rollups').all(),
    ).toEqual([{ min: 1, max: 5, sum: 6, count: 2 }])
  })
})
