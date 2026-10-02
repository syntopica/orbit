import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'

import { AUTH_SCHEMA_SQL } from '../state/authSchemaSql'
import { openDatabase } from '../state/openDatabase'

export const openAuthDb = (): DatabaseSync =>
  openDatabase(
    join(mkdtempSync(join(tmpdir(), 'orbit-auth-')), 'auth.sqlite3'),
    AUTH_SCHEMA_SQL,
  )
