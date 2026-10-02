import { openAuthDb } from '../test/openAuthDb'
import { consumeRateLimit } from './consumeRateLimit'

describe('consumeRateLimit', () => {
  it('allows up to the limit per minute window', () => {
    const db = openAuthDb()
    const rule = { key: 'session:global', limit: 2 }
    expect(consumeRateLimit(db, rule, 0)).toBe(true)
    expect(consumeRateLimit(db, rule, 10)).toBe(true)
    expect(consumeRateLimit(db, rule, 20)).toBe(false)
    expect(consumeRateLimit(db, rule, 60_000)).toBe(true)
  })
  it('keeps the last window of the minute and starts a new one at the boundary', () => {
    const db = openAuthDb()
    const rule = { key: 'k', limit: 1 }
    expect(consumeRateLimit(db, rule, 59_999)).toBe(true)
    expect(consumeRateLimit(db, rule, 59_999)).toBe(false)
    expect(consumeRateLimit(db, rule, 60_000)).toBe(true)
    expect(consumeRateLimit(db, rule, 119_999)).toBe(false)
  })
  it('counts keys independently and prunes windows older than the previous one', () => {
    const db = openAuthDb()
    expect(consumeRateLimit(db, { key: 'a', limit: 1 }, 0)).toBe(true)
    expect(consumeRateLimit(db, { key: 'b', limit: 1 }, 0)).toBe(true)
    expect(consumeRateLimit(db, { key: 'a', limit: 1 }, 180_000)).toBe(true)
    const rows = db.prepare('SELECT key, window FROM rate_limits').all()
    expect(rows).toEqual([{ key: 'a', window: 3 }])
  })
})
