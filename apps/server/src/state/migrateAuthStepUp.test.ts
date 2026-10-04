import { DatabaseSync } from 'node:sqlite'

import { AUTH_SCHEMA_SQL } from './authSchemaSql'
import { migrateAuthStepUp } from './migrateAuthStepUp'

describe('migrateAuthStepUp', () => {
  it('adds the column to an existing auth store without losing sessions', () => {
    const db = new DatabaseSync(':memory:')
    db.exec(AUTH_SCHEMA_SQL)
    db.prepare(
      'INSERT INTO sessions (hash, created, last_seen, expires) VALUES (?, ?, ?, ?)',
    ).run('hash', 1, 1, 100)
    migrateAuthStepUp(db)
    migrateAuthStepUp(db)
    const columns = db.prepare('PRAGMA table_info(sessions)').all() as {
      name: string
    }[]
    expect(
      columns.filter((column) => column.name === 'step_up_at'),
    ).toHaveLength(1)
    expect(
      db.prepare('SELECT hash, step_up_at FROM sessions').get(),
    ).toMatchObject({ hash: 'hash', step_up_at: null })
    db.close()
  })
})
