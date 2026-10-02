import type { DatabaseSync } from 'node:sqlite'

import { InvalidPrefixError } from './InvalidPrefixError'

export const revokeSessions = (db: DatabaseSync, rawPrefix: string): number => {
  const prefix = rawPrefix.toLowerCase()
  if (!/^[0-9a-f]{8,64}$/.test(prefix)) throw new InvalidPrefixError()
  const result = db
    .prepare('DELETE FROM sessions WHERE substr(hash, 1, ?) = ?')
    .run(prefix.length, prefix)
  return Number(result.changes)
}
