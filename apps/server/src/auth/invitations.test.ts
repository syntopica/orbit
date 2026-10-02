import { openAuthDb } from '../test/openAuthDb'
import { createInvitation } from './createInvitation'
import { hashSecret } from './hashSecret'
import { redeemInvitation } from './redeemInvitation'
import { touchSession } from './touchSession'

const wrong = (id: string) => ({ id, secret: 'wrong' })

describe('invitations', () => {
  it('redeems once into a working session', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    const session = redeemInvitation(db, invitation, 1000)
    expect(session).not.toBeNull()
    expect(touchSession(db, session ?? '', 2000)).toBe(true)
    expect(redeemInvitation(db, invitation, 3000)).toBeNull()
  })
  it('does not consume the invitation on a wrong secret', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    expect(redeemInvitation(db, wrong(invitation.id), 1)).toBeNull()
    expect(redeemInvitation(db, invitation, 2)).not.toBeNull()
  })
  it('returns null for an unknown id', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    expect(redeemInvitation(db, { ...invitation, id: 'nope' }, 1)).toBeNull()
  })
  it('is valid 1 ms before expiry and refused exactly at it', () => {
    const limit = 5 * 60_000
    const dbA = openAuthDb()
    const a = createInvitation(dbA, 0)
    expect(redeemInvitation(dbA, a, limit - 1)).not.toBeNull()
    const dbB = openAuthDb()
    const b = createInvitation(dbB, 0)
    expect(redeemInvitation(dbB, b, limit)).toBeNull()
  })
  it('still accepts the right secret after four wrong ones', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    for (let i = 0; i < 4; i += 1) {
      expect(redeemInvitation(db, wrong(invitation.id), 1)).toBeNull()
    }
    expect(redeemInvitation(db, invitation, 2)).not.toBeNull()
  })
  it('refuses the right secret after five wrong ones', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    for (let i = 0; i < 5; i += 1) {
      expect(redeemInvitation(db, wrong(invitation.id), 1)).toBeNull()
    }
    expect(redeemInvitation(db, invitation, 2)).toBeNull()
  })
  it('commits the failure count of a wrong secret', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    redeemInvitation(db, wrong(invitation.id), 1)
    const row = db
      .prepare('SELECT failures FROM invitations WHERE id = ?')
      .get(invitation.id) as { failures: number }
    expect(row.failures).toBe(1)
  })
  it('stores only the hash of the secret', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    const row = db
      .prepare('SELECT secret_hash AS hash FROM invitations WHERE id = ?')
      .get(invitation.id) as { hash: string }
    expect(row.hash).toBe(hashSecret(invitation.secret))
    expect(row.hash).not.toBe(invitation.secret)
    expect(
      JSON.stringify(db.prepare('SELECT * FROM invitations').all()),
    ).not.toContain(invitation.secret)
  })
  it('rolls back and rethrows when the redeem fails midway', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    db.exec('DROP TABLE sessions')
    expect(() => redeemInvitation(db, invitation, 1)).toThrow()
    const row = db
      .prepare('SELECT used FROM invitations WHERE id = ?')
      .get(invitation.id) as { used: number }
    expect(row.used).toBe(0)
    expect(db.isTransaction).toBe(false)
  })
  it('has 64-bit ids and 128-bit secrets', () => {
    const invitation = createInvitation(openAuthDb(), 0)
    expect(Buffer.from(invitation.id, 'base64url')).toHaveLength(8)
    expect(Buffer.from(invitation.secret, 'base64url')).toHaveLength(16)
  })
})
