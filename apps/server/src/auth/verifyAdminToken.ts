import type { DatabaseSync } from 'node:sqlite'

import { hashSecret } from './hashSecret'
import { secretsEqual } from './secretsEqual'

export const verifyAdminToken = (db: DatabaseSync, token: string): boolean => {
  const row = db.prepare('SELECT hash FROM admin_token WHERE id = 1').get() as
    { hash: string } | undefined
  return row !== undefined && secretsEqual(row.hash, hashSecret(token))
}
