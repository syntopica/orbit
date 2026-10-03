import type { ComponentId, EventMessage, Snapshot } from '@orbit/contract'

export type StreamState = {
  readonly snapshots: Partial<Record<ComponentId, Snapshot>>
  readonly events: readonly EventMessage[]
  readonly lastId: number | null
  readonly synced: boolean
}
