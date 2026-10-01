import { chmodSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'

export const openDatabase = (path: string, schemaSql: string): DatabaseSync => {
  const db = new DatabaseSync(path)
  chmodSync(path, 0o600)
  db.exec(
    'PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;',
  )
  db.exec(schemaSql)
  return db
}
