import type { DatabaseSync } from 'node:sqlite'

export const revokeSessions = (db: DatabaseSync, rawPrefix: string): number => {
  const prefix = rawPrefix.toLowerCase()
  if (!/^[0-9a-f]{8,64}$/.test(prefix))
    throw new Error('prefix must be at least 8 hex characters')
  const result = db
    .prepare('DELETE FROM sessions WHERE substr(hash, 1, ?) = ?')
    .run(prefix.length, prefix)
  return Number(result.changes)
}
