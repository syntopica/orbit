import { openHistoryDb } from '../test/openHistoryDb'
import { pruneHistory } from './pruneHistory'

const insertSampleSql =
  'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)'
const insertObservationSql =
  'INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, ?, ?, ?, ?)'
const queued = 'worker.queued'
const hour = 3_600_000
const day = 24 * hour

describe('pruneHistory', () => {
  it('rolls up complete hours idempotently and applies retention', () => {
    const db = openHistoryDb()
    const now = 100 * day + 30 * 60_000
    const insert = db.prepare(insertSampleSql)
    insert.run('worker', queued, 2, now - hour)
    insert.run('worker', queued, 6, now - hour + 60_000)
    insert.run('worker', queued, 9, now - 8 * day)
    const observe = db.prepare(insertObservationSql)
    observe.run('a', null, 1, 0, now - 95 * day)
    observe.run('a', null, 2, 0, now - 92 * day)
    observe.run('b', null, 1, 0, now - 120 * day)
    db.prepare('INSERT INTO runs (started, stopped) VALUES (?, ?)').run(
      now - 91 * day,
      now - 91 * day,
    )
    pruneHistory(db, now)
    pruneHistory(db, now)
    const rollup = db
      .prepare('SELECT min, max, sum, count FROM metric_rollups ORDER BY hour')
      .all()
    // The 8-day-old sample is rolled up before samples past 7 days are dropped.
    expect(rollup).toEqual([
      { min: 9, max: 9, sum: 9, count: 1 },
      { min: 2, max: 6, sum: 8, count: 2 },
    ])
    expect(
      db.prepare('SELECT count(*) AS n FROM metric_samples').get(),
    ).toEqual({ n: 2 })
    expect(
      db
        .prepare('SELECT label, runs FROM launchd_observations ORDER BY label')
        .all(),
    ).toEqual([
      { label: 'a', runs: 2 },
      { label: 'b', runs: 1 },
    ])
    expect(db.prepare('SELECT count(*) AS n FROM runs').get()).toEqual({ n: 0 })
  })

  it('keeps the newest observation before the cutoff as a baseline', () => {
    const db = openHistoryDb()
    const now = 100 * day
    const observe = db.prepare(insertObservationSql)
    observe.run('a', null, 1, 0, now - 95 * day)
    observe.run('a', null, 2, 0, now - 92 * day)
    observe.run('a', null, 3, 0, now - 10 * day)
    pruneHistory(db, now)
    expect(
      db
        .prepare('SELECT runs FROM launchd_observations ORDER BY at')
        .all()
        .map((row) => (row as { runs: number }).runs),
    ).toEqual([2, 3])
  })

  it('shrinks to the cap, oldest metric samples first, then older observations and rollups, keeping each latest per label', () => {
    const db = openHistoryDb()
    const now = Date.now()
    for (let i = 0; i < 500; i += 1) {
      db.prepare(insertSampleSql).run('worker', queued, i, now - i)
    }
    db.prepare(insertObservationSql).run('a', 1, 1, 0, now)
    db.prepare(insertObservationSql).run('a', 1, 0, 0, now - 5)
    db.prepare(
      'INSERT INTO metric_rollups (component, key, hour, min, max, sum, count) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run('worker', queued, 1, 1, 1, 1, 1)
    pruneHistory(db, now, 10 * 1024 * 1024)
    expect(
      db.prepare('SELECT count(*) AS n FROM metric_samples').get(),
    ).toEqual({ n: 500 })
    pruneHistory(db, now, 1)
    expect(
      db.prepare('SELECT count(*) AS n FROM metric_samples').get(),
    ).toEqual({ n: 0 })
    expect(
      db.prepare('SELECT label, at FROM launchd_observations').all(),
    ).toEqual([{ label: 'a', at: now }])
    expect(
      db.prepare('SELECT count(*) AS n FROM metric_rollups').get(),
    ).toEqual({ n: 0 })
  })
})
