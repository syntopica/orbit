import { openAuthDb } from '../test/openAuthDb'
import { createAdminToken } from './createAdminToken'
import { verifyAdminToken } from './verifyAdminToken'

describe('admin token', () => {
  it('verifies only the latest token and stores no plaintext', () => {
    const db = openAuthDb()
    expect(verifyAdminToken(db, 'anything')).toBe(false)
    const first = createAdminToken(db, 1)
    const second = createAdminToken(db, 2)
    expect(second).toHaveLength(43)
    expect(verifyAdminToken(db, first)).toBe(false)
    expect(verifyAdminToken(db, second)).toBe(true)
    const stored = db.prepare('SELECT hash FROM admin_token').get() as {
      hash: string
    }
    expect(stored.hash).not.toContain(second)
  })
  it('rejects empty and near-miss tokens', () => {
    const db = openAuthDb()
    const token = createAdminToken(db, 1)
    expect(verifyAdminToken(db, '')).toBe(false)
    expect(verifyAdminToken(db, token.slice(0, -1))).toBe(false)
    expect(verifyAdminToken(db, `${token}x`)).toBe(false)
  })
})
