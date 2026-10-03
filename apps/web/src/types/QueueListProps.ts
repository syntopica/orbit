import type { WorkerQueue } from '@orbit/contract'

import type { WorkerActivityState } from './WorkerActivityState'

export type QueueListProps = {
  readonly rows: readonly WorkerQueue[]
  readonly activity: WorkerActivityState
}
