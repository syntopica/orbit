import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { AUTH_SCHEMA_SQL } from './authSchemaSql'
import { openDatabase } from './openDatabase'

describe('openDatabase', () => {
  it('creates the schema in WAL mode with private permissions', async () => {
    const path = join(
      await mkdtemp(join(tmpdir(), 'orbit-db-')),
      'auth.sqlite3',
    )
    const db = openDatabase(path, AUTH_SCHEMA_SQL)
    const mode = db.prepare('PRAGMA journal_mode').get() as {
      journal_mode: string
    }
    expect(mode.journal_mode).toBe('wal')
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
      )
      .all()
    expect(tables.map((t) => (t as { name: string }).name)).toEqual([
      'admin_token',
      'audit',
      'invitations',
      'rate_limits',
      'sessions',
    ])
    expect((await stat(path)).mode & 0o777).toBe(0o600)
    db.close()
  })
})
