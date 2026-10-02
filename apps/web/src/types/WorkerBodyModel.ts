import type { WorkerQueue, WorkerView } from '@orbit/contract'

import type { FailureGroup } from './FailureGroup'
import type { WorkerDiagnosis } from './WorkerDiagnosis'

export type WorkerBodyModel = {
  readonly view: WorkerView
  readonly diagnosis: WorkerDiagnosis
  readonly activeQueues: readonly WorkerQueue[]
  readonly idleQueues: readonly WorkerQueue[]
  readonly failures: readonly FailureGroup[]
}
