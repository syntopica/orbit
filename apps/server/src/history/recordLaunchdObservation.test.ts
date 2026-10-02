import { openHistoryDb } from '../test/openHistoryDb'
import { recordLaunchdObservation } from './recordLaunchdObservation'

const base = { label: 'com.example.job', pid: null, runs: 3, lastExit: 0 }
const times = (db: ReturnType<typeof openHistoryDb>): number[] =>
  (
    db.prepare('SELECT at FROM launchd_observations ORDER BY at').all() as {
      at: number
    }[]
  ).map((r) => r.at)

describe('recordLaunchdObservation', () => {
  it('stores an observation only on change', () => {
    const db = openHistoryDb()
    recordLaunchdObservation(db, { ...base, at: 1 })
    recordLaunchdObservation(db, { ...base, at: 2 })
    recordLaunchdObservation(db, { ...base, runs: 4, at: 3 })
    recordLaunchdObservation(db, { ...base, runs: 4, lastExit: 78, at: 4 })
    expect(times(db)).toEqual([1, 3, 4])
  })

  it('stores a change of pid alone', () => {
    const db = openHistoryDb()
    recordLaunchdObservation(db, { ...base, at: 1 })
    recordLaunchdObservation(db, { ...base, pid: 42, at: 2 })
    expect(times(db)).toEqual([1, 2])
  })

  it('stores a first observation whose fields are all null', () => {
    const db = openHistoryDb()
    const empty = { label: 'x', pid: null, runs: null, lastExit: null }
    recordLaunchdObservation(db, { ...empty, at: 1 })
    recordLaunchdObservation(db, { ...empty, at: 2 })
    expect(times(db)).toEqual([1])
  })

  it('compares per label', () => {
    const db = openHistoryDb()
    recordLaunchdObservation(db, { ...base, at: 1 })
    recordLaunchdObservation(db, { ...base, label: 'com.example.other', at: 2 })
    expect(times(db)).toEqual([1, 2])
  })

  it('compares against the last inserted observation when timestamps tie', () => {
    const db = openHistoryDb()
    recordLaunchdObservation(db, { ...base, at: 1 })
    recordLaunchdObservation(db, { ...base, runs: 4, at: 1 })
    recordLaunchdObservation(db, { ...base, runs: 4, at: 1 })
    expect(times(db)).toEqual([1, 1])
  })
})
