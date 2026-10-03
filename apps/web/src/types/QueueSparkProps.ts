import type { WorkerActivityModel } from './WorkerActivityModel'

export type QueueSparkProps = {
  readonly name: string
  readonly model: WorkerActivityModel | null
  readonly stale: boolean
}
