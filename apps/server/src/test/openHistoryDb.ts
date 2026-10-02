import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'

import { HISTORY_SCHEMA_SQL } from '../history/historySchemaSql'
import { openDatabase } from '../state/openDatabase'

export const openHistoryDb = (): DatabaseSync =>
  openDatabase(
    join(mkdtempSync(join(tmpdir(), 'orbit-history-')), 'history.sqlite3'),
    HISTORY_SCHEMA_SQL,
  )
