import type { WorkerActivityModel } from './WorkerActivityModel'
import type { WorkerRange } from './WorkerRange'

export type WorkerActivityState = {
  readonly model: WorkerActivityModel | null
  // A refetch for a new range is in flight: the last render stays, dimmed.
  readonly stale: boolean
  readonly failed: boolean
  readonly range: WorkerRange
  readonly setRange: (range: WorkerRange) => void
}
