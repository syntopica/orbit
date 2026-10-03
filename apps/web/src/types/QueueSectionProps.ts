import type { WorkerQueue } from '@orbit/contract'

import type { WorkerActivityState } from './WorkerActivityState'

export type QueueSectionProps = {
  readonly active: readonly WorkerQueue[]
  readonly idle: readonly WorkerQueue[]
  readonly isPhone: boolean
  readonly activity: WorkerActivityState
}
