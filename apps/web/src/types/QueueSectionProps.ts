import type { WorkerQueue } from '@orbit/contract'

export type QueueSectionProps = {
  readonly active: readonly WorkerQueue[]
  readonly idle: readonly WorkerQueue[]
  readonly isPhone: boolean
}
