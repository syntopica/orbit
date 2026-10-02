import { openAuthDb } from '../test/openAuthDb'
import { recordAudit } from './recordAudit'

describe('recordAudit', () => {
  it('stores the action, outcome and time only', () => {
    const db = openAuthDb()
    recordAudit(db, 'session.pair', 'denied', 42)
    expect(db.prepare('SELECT at, action, outcome FROM audit').all()).toEqual([
      { at: 42, action: 'session.pair', outcome: 'denied' },
    ])
  })
})
