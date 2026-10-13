import type { WorkerQueue } from '@orbit/contract'

export type QueueSplit = {
  readonly active: WorkerQueue[]
  readonly idle: WorkerQueue[]
}
