import type { DatabaseSync } from 'node:sqlite'

import { hashSecret } from './hashSecret'

export const deleteSession = (db: DatabaseSync, id: string): void => {
  db.prepare('DELETE FROM sessions WHERE hash = ?').run(hashSecret(id))
}
