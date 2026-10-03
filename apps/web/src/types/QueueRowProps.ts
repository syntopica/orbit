import type { WorkerQueue } from '@orbit/contract'

import type { WorkerActivityModel } from './WorkerActivityModel'

export type QueueRowProps = {
  readonly queue: WorkerQueue
  readonly model: WorkerActivityModel | null
  readonly stale: boolean
  readonly open: boolean
  readonly onToggle: () => void
}
