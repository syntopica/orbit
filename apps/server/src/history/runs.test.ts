import { openHistoryDb } from '../test/openHistoryDb'
import { startRun } from './startRun'
import { touchRun } from './touchRun'

describe('runs', () => {
  it('starts a run as an empty interval and extends only that run', () => {
    const db = openHistoryDb()
    expect(startRun(db, 10)).toBe(10)
    startRun(db, 20)
    touchRun(db, 10, 15)
    expect(
      db.prepare('SELECT started, stopped FROM runs ORDER BY started').all(),
    ).toEqual([
      { started: 10, stopped: 15 },
      { started: 20, stopped: 20 },
    ])
  })

  it('restarting at the same instant replaces the row', () => {
    const db = openHistoryDb()
    touchRun(db, startRun(db, 10), 50)
    startRun(db, 10)
    expect(db.prepare('SELECT stopped FROM runs').all()).toEqual([
      { stopped: 10 },
    ])
  })
})
