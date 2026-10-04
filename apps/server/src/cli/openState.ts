import { join } from 'node:path'

import { createLatestClipsDocuments } from '../adapters/clips/createLatestClipsDocuments'
import { loadInstanceConfig } from '../config/loadInstanceConfig'
import { loadOrbitConfig } from '../config/loadOrbitConfig'
import { resolveDataDir } from '../config/resolveDataDir'
import { HISTORY_SCHEMA_SQL } from '../history/historySchemaSql'
import { AUTH_SCHEMA_SQL } from '../state/authSchemaSql'
import { ensureStateDir } from '../state/ensureStateDir'
import { migrateAuthStepUp } from '../state/migrateAuthStepUp'
import { openDatabase } from '../state/openDatabase'
import type { OrbitState } from '../types/OrbitState'

export const openState = async (
  env: NodeJS.ProcessEnv,
): Promise<OrbitState> => {
  // Before any database opens, so the -wal and -shm side files are 0600 too.
  process.umask(0o077)
  const dataDir = resolveDataDir(env)
  const instance = await loadInstanceConfig(dataDir)
  const stateDir = await ensureStateDir(dataDir)
  const config = await loadOrbitConfig(dataDir)
  const authDb = openDatabase(join(stateDir, 'auth.sqlite3'), AUTH_SCHEMA_SQL)
  migrateAuthStepUp(authDb)
  const historyDb = openDatabase(
    join(stateDir, 'history.sqlite3'),
    HISTORY_SCHEMA_SQL,
  )
  return {
    dataDir,
    stateDir,
    config,
    instance,
    env,
    authDb,
    historyDb,
    clipsLatest: createLatestClipsDocuments(Date.now),
    // Idempotent: a failed start and its caller may both close.
    close: () => {
      if (authDb.isOpen) authDb.close()
      if (historyDb.isOpen) historyDb.close()
    },
  }
}
