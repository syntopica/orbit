import type { DatabaseSync } from 'node:sqlite'

import { hashSecret } from './hashSecret'
import { randomToken } from './randomToken'

export const createAdminToken = (db: DatabaseSync, now: number): string => {
  const token = randomToken(32)
  db.prepare(
    'INSERT INTO admin_token (id, hash, created) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET hash = excluded.hash, created = excluded.created',
  ).run(hashSecret(token), now)
  return token
}
