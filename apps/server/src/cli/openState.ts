import { join } from 'node:path'

import { loadInstanceConfig } from '../config/loadInstanceConfig'
import { loadOrbitConfig } from '../config/loadOrbitConfig'
import { resolveDataDir } from '../config/resolveDataDir'
import { HISTORY_SCHEMA_SQL } from '../history/historySchemaSql'
import { AUTH_SCHEMA_SQL } from '../state/authSchemaSql'
import { ensureStateDir } from '../state/ensureStateDir'
import { openDatabase } from '../state/openDatabase'
import type { OrbitState } from '../types/OrbitState'

export const openState = async (
  env: NodeJS.ProcessEnv,
): Promise<OrbitState> => {
  // Before any database opens, so the -wal and -shm side files are 0600 too.
  process.umask(0o077)
  const dataDir = resolveDataDir(env)
  await loadInstanceConfig(dataDir)
  const stateDir = await ensureStateDir(dataDir)
  const config = await loadOrbitConfig(dataDir)
  const authDb = openDatabase(join(stateDir, 'auth.sqlite3'), AUTH_SCHEMA_SQL)
  const historyDb = openDatabase(
    join(stateDir, 'history.sqlite3'),
    HISTORY_SCHEMA_SQL,
  )
  return {
    dataDir,
    stateDir,
    config,
    authDb,
    historyDb,
    close: () => {
      authDb.close()
      historyDb.close()
    },
  }
}
