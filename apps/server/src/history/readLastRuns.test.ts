import type { DatabaseSync } from 'node:sqlite'

import { openHistoryDb } from '../test/openHistoryDb'
import { readLastRuns } from './readLastRuns'

const observe = (db: DatabaseSync, label: string, runs: number, at: number) => {
  db.prepare(
    'INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, NULL, ?, 0, ?)',
  ).run(label, runs, at)
}

const labelA = 'com.example.a'

describe('readLastRuns', () => {
  it('takes the newest observation whose run count rose, per label', () => {
    const db = openHistoryDb()
    observe(db, labelA, 1, 1000)
    observe(db, labelA, 2, 2000)
    observe(db, labelA, 2, 3000)
    observe(db, 'com.example.b', 5, 1000)
    observe(db, 'com.example.c', 1, 1000)
    observe(db, 'com.example.c', 3, 4000)
    expect(
      readLastRuns(db, [labelA, 'com.example.b', 'com.example.d']),
    ).toEqual(new Map([[labelA, 2000]]))
    expect(readLastRuns(db, [])).toEqual(new Map())
  })
  it('compares observations by timestamp and row order through resets', () => {
    const db = openHistoryDb()
    observe(db, labelA, 8, 3000)
    observe(db, labelA, 5, 1000)
    observe(db, labelA, 6, 2000)
    observe(db, labelA, 0, 4000)
    observe(db, labelA, 1, 4000)
    observe(db, labelA, 1, 5000)
    expect(readLastRuns(db, [labelA])).toEqual(new Map([[labelA, 4000]]))
  })
})
