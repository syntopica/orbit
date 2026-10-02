import type { WorkerQueue } from '@orbit/contract'

export type QueueTableProps = {
  readonly rows: readonly WorkerQueue[]
  readonly isPhone: boolean
}
