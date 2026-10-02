import type { ComponentId, Pending } from '@orbit/contract'

export type PendingRow = {
  readonly component: ComponentId
  readonly key: Pending['key']
  readonly label: string
  readonly count: number
  readonly oldestAt: string | null
  readonly stale: boolean
}
