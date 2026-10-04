import type { FlowStageId } from '@orbit/contract'

import type { DatabaseSync } from 'node:sqlite'

import type { AtriumDeps } from './AtriumDeps'
import type { BrainReaders } from './BrainReaders'
import type { ClipsReader } from './ClipsReader'
import type { GuardConfig } from './GuardConfig'
import type { Hub } from './Hub'
import type { LaunchdCatalog } from './LaunchdCatalog'
import type { WorkerActivityReader } from './WorkerActivityReader'
import type { WorkerCostsReader } from './WorkerCostsReader'
import type { WorkerJobClient } from './WorkerJobClient'
import type { WorkerQualityReader } from './WorkerQualityReader'
import type { WorkerReader } from './WorkerReader'

export type AppDeps = {
  readonly authDb: DatabaseSync
  readonly historyDb: DatabaseSync
  readonly hub: Hub
  readonly stageLabels: ReadonlyMap<FlowStageId, string>
  readonly brain: BrainReaders | null
  readonly clips: ClipsReader | null
  readonly atrium: AtriumDeps | null
  readonly catalog: LaunchdCatalog | null
  readonly worker: WorkerReader | null
  readonly workerActivity: WorkerActivityReader | null
  readonly workerCosts: WorkerCostsReader | null
  readonly workerQuality: WorkerQualityReader | null
  readonly workerJobs: WorkerJobClient | null
  readonly guard: GuardConfig
  readonly webRoot: string
  readonly now: () => number
}
