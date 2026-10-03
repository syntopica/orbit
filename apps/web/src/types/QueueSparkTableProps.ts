import type { WorkerActivityModel } from './WorkerActivityModel'

export type QueueSparkTableProps = {
  readonly model: WorkerActivityModel
  readonly values: readonly number[]
}
