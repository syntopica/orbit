import { openAuthDb } from '../test/openAuthDb'
import { AUTH_DURATIONS } from './authDurations'
import { createSession } from './createSession'
import { deleteSession } from './deleteSession'
import { listSessions } from './listSessions'
import { revokeSessions } from './revokeSessions'
import { touchSession } from './touchSession'

const day = 86_400_000
const { sessionSlidingMs, sessionAbsoluteMs } = AUTH_DURATIONS

describe('sessions', () => {
  it('slides the expiry on use', () => {
    const db = openAuthDb()
    const id = createSession(db, 0)
    expect(touchSession(db, id, 6 * day)).toBe(true)
    expect(touchSession(db, id, 12 * day)).toBe(true)
    expect(touchSession(db, id, 20 * day)).toBe(false)
  })
  it('expires exactly at the sliding limit and not a millisecond before', () => {
    const db = openAuthDb()
    expect(touchSession(db, createSession(db, 0), sessionSlidingMs - 1)).toBe(
      true,
    )
    expect(touchSession(db, createSession(db, 0), sessionSlidingMs)).toBe(false)
  })
  it('deletes an expired row', () => {
    const db = openAuthDb()
    touchSession(db, createSession(db, 0), sessionSlidingMs)
    expect(listSessions(db)).toEqual([])
  })
  it('enforces the absolute expiry even with constant use', () => {
    const db = openAuthDb()
    const id = createSession(db, 0)
    for (let t = day; t < sessionAbsoluteMs; t += day) {
      expect(touchSession(db, id, t)).toBe(true)
    }
    expect(touchSession(db, id, sessionAbsoluteMs - 1)).toBe(true)
    expect(touchSession(db, id, sessionAbsoluteMs)).toBe(false)
  })
  it('caps the slid expiry at the absolute limit', () => {
    const db = openAuthDb()
    const id = createSession(db, 0)
    for (const t of [6, 12, 18, 24, 29]) touchSession(db, id, t * day)
    expect(listSessions(db)[0]?.expires).toBe(sessionAbsoluteMs)
  })
  it('rejects unknown ids, deletes on logout', () => {
    const db = openAuthDb()
    expect(touchSession(db, 'nope', 0)).toBe(false)
    const a = createSession(db, 0)
    deleteSession(db, a)
    expect(touchSession(db, a, 1)).toBe(false)
  })
  it('stores only the hash of the session id', () => {
    const db = openAuthDb()
    const id = createSession(db, 0)
    const stored = db.prepare('SELECT hash FROM sessions').get() as {
      hash: string
    }
    expect(stored.hash).not.toContain(id)
    expect(stored.hash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('revokeSessions', () => {
  it('revokes by an 8 character prefix and refuses 7', () => {
    const db = openAuthDb()
    createSession(db, 0)
    const prefix = listSessions(db)[0]?.prefix ?? ''
    expect(prefix).toHaveLength(8)
    expect(() => revokeSessions(db, prefix.slice(0, 7))).toThrow()
    expect(() => revokeSessions(db, 'abc')).toThrow()
    expect(listSessions(db)).toHaveLength(1)
    expect(revokeSessions(db, prefix)).toBe(1)
    expect(listSessions(db)).toEqual([])
  })
  it('treats wildcards literally and never matches everything', () => {
    const db = openAuthDb()
    createSession(db, 0)
    createSession(db, 0)
    expect(() => revokeSessions(db, '%%%%%%%%')).toThrow()
    expect(() => revokeSessions(db, '________')).toThrow()
    expect(() => revokeSessions(db, '')).toThrow()
    expect(listSessions(db)).toHaveLength(2)
  })
  it('revokes only matching sessions', () => {
    const db = openAuthDb()
    createSession(db, 0)
    createSession(db, 1)
    const [first] = listSessions(db)
    expect(revokeSessions(db, first?.prefix ?? '')).toBe(1)
    expect(listSessions(db)).toHaveLength(1)
  })
})
