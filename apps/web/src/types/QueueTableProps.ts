import type { WorkerQueue } from '@orbit/contract'

import type { WorkerActivityState } from './WorkerActivityState'

export type QueueTableProps = {
  readonly rows: readonly WorkerQueue[]
  readonly isPhone: boolean
  readonly activity: WorkerActivityState
}
