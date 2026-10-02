import type { DatabaseSync } from 'node:sqlite'

import type { Invitation } from '../types/Invitation'
import { AUTH_DURATIONS } from './authDurations'
import { hashSecret } from './hashSecret'
import { randomToken } from './randomToken'

export const createInvitation = (db: DatabaseSync, now: number): Invitation => {
  const invitation = { id: randomToken(8), secret: randomToken(16) }
  db.prepare(
    'INSERT INTO invitations (id, secret_hash, expires) VALUES (?, ?, ?)',
  ).run(
    invitation.id,
    hashSecret(invitation.secret),
    now + AUTH_DURATIONS.invitationMs,
  )
  return invitation
}
