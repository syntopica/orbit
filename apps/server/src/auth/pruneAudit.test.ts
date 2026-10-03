import { openAuthDb } from '../test/openAuthDb'
import { AUDIT_LIMITS } from './auditLimits'
import { pruneAudit } from './pruneAudit'

const insert = (db: ReturnType<typeof openAuthDb>, at: number) =>
  db
    .prepare('INSERT INTO audit (at, action, outcome) VALUES (?, ?, ?)')
    .run(at, 'session.create', 'denied')

const ats = (db: ReturnType<typeof openAuthDb>) =>
  db
    .prepare('SELECT at FROM audit ORDER BY at')
    .all()
    .map((row) => (row as { at: number }).at)

describe('pruneAudit', () => {
  it('drops rows older than the age limit', () => {
    const db = openAuthDb()
    const now = AUDIT_LIMITS.maxAgeMs + 1000
    insert(db, 999)
    insert(db, 1000)
    pruneAudit(db, now)
    expect(ats(db)).toEqual([1000])
  })
  it('keeps only the newest rows past the row cap', () => {
    const db = openAuthDb()
    const now = 1_000_000
    for (let i = 0; i < AUDIT_LIMITS.maxRows + 5; i += 1) insert(db, now - i)
    pruneAudit(db, now)
    const kept = ats(db)
    expect(kept).toHaveLength(AUDIT_LIMITS.maxRows)
    expect(kept[0]).toBe(now - AUDIT_LIMITS.maxRows + 1)
  })
})
