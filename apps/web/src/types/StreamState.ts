import type { ComponentId, OrbitEvent, Snapshot } from '@orbit/contract'

export type StreamState = {
  readonly snapshots: Partial<Record<ComponentId, Snapshot>>
  readonly events: readonly OrbitEvent[]
  readonly lastId: number | null
  readonly synced: boolean
}
