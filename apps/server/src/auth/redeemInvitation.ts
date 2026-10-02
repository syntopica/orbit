import type { DatabaseSync } from 'node:sqlite'

import type { Invitation } from '../types/Invitation'
import { AUTH_DURATIONS } from './authDurations'
import { createSession } from './createSession'
import { hashSecret } from './hashSecret'
import { secretsEqual } from './secretsEqual'

export const redeemInvitation = (
  db: DatabaseSync,
  invitation: Invitation,
  now: number,
): string | null => {
  db.exec('BEGIN IMMEDIATE')
  try {
    const row = db
      .prepare(
        'SELECT secret_hash AS hash, failures FROM invitations WHERE id = ? AND used = 0 AND expires > ?',
      )
      .get(invitation.id, now) as { hash: string; failures: number } | undefined
    let session: string | null = null
    if (
      row !== undefined &&
      row.failures < AUTH_DURATIONS.invitationMaxFailures
    ) {
      if (secretsEqual(row.hash, hashSecret(invitation.secret))) {
        db.prepare('UPDATE invitations SET used = 1 WHERE id = ?').run(
          invitation.id,
        )
        session = createSession(db, now)
      } else {
        db.prepare(
          'UPDATE invitations SET failures = failures + 1 WHERE id = ?',
        ).run(invitation.id)
      }
    }
    db.exec('COMMIT')
    return session
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
