import { openHistoryDb } from '../test/openHistoryDb'
import { readLaunchdHistory } from './readLaunchdHistory'
import { recordLaunchdObservation } from './recordLaunchdObservation'
import { startRun } from './startRun'
import { touchRun } from './touchRun'

describe('readLaunchdHistory', () => {
  it('returns the range, the observation before it, and overlapping runs', () => {
    const db = openHistoryDb()
    const run = startRun(db, 0)
    touchRun(db, run, 500)
    recordLaunchdObservation(db, {
      label: 'a',
      pid: null,
      runs: 1,
      lastExit: 0,
      at: 50,
    })
    recordLaunchdObservation(db, {
      label: 'a',
      pid: null,
      runs: 2,
      lastExit: 0,
      at: 150,
    })
    recordLaunchdObservation(db, {
      label: 'b',
      pid: 9,
      runs: 1,
      lastExit: null,
      at: 160,
    })
    recordLaunchdObservation(db, {
      label: 'a',
      pid: null,
      runs: 3,
      lastExit: 0,
      at: 250,
    })
    const history = readLaunchdHistory(db, 'a', 200)
    expect(history.observations.map((o) => o.at)).toEqual([150, 250])
    expect(history.runs).toEqual([{ started: 0, stopped: 500 }])
  })

  it('includes an observation exactly at from and no earlier baseline then', () => {
    const db = openHistoryDb()
    recordLaunchdObservation(db, {
      label: 'a',
      pid: null,
      runs: 1,
      lastExit: 0,
      at: 100,
    })
    recordLaunchdObservation(db, {
      label: 'a',
      pid: null,
      runs: 2,
      lastExit: 0,
      at: 200,
    })
    const history = readLaunchdHistory(db, 'a', 200)
    expect(history.observations.map((o) => o.at)).toEqual([100, 200])
  })

  it('returns an empty history for an unknown label', () => {
    expect(readLaunchdHistory(openHistoryDb(), 'none', 0)).toEqual({
      observations: [],
      runs: [],
    })
  })

  it('keeps a run that stopped exactly at from and drops one that stopped before', () => {
    const db = openHistoryDb()
    touchRun(db, startRun(db, 10), 99)
    touchRun(db, startRun(db, 20), 100)
    touchRun(db, startRun(db, 300), 400)
    const history = readLaunchdHistory(db, 'a', 100)
    expect(history.runs).toEqual([
      { started: 20, stopped: 100 },
      { started: 300, stopped: 400 },
    ])
  })

  it('keeps a run that began before from and is still open past it', () => {
    const db = openHistoryDb()
    touchRun(db, startRun(db, 0), 1000)
    expect(readLaunchdHistory(db, 'a', 500).runs).toEqual([
      { started: 0, stopped: 1000 },
    ])
  })
})
