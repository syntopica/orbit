import type { DatabaseSync } from 'node:sqlite'

import type { GuardConfig } from './GuardConfig'
import type { Hub } from './Hub'
import type { LaunchdCatalog } from './LaunchdCatalog'
import type { WorkerActivityReader } from './WorkerActivityReader'
import type { WorkerReader } from './WorkerReader'

export type AppDeps = {
  readonly authDb: DatabaseSync
  readonly historyDb: DatabaseSync
  readonly hub: Hub
  readonly catalog: LaunchdCatalog | null
  readonly worker: WorkerReader | null
  readonly workerActivity: WorkerActivityReader | null
  readonly guard: GuardConfig
  readonly webRoot: string
  readonly now: () => number
}
