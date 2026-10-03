import type { WorkerActivityModel } from './WorkerActivityModel'

export type QueueDetailProps = {
  readonly id: string
  readonly name: string
  readonly model: WorkerActivityModel | null
}
