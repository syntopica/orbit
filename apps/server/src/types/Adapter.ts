import type { ComponentId, SnapshotCore } from '@orbit/contract'

export type Adapter = {
  readonly id: ComponentId
  readonly cadenceMs: number
  readonly timeoutMs: number
  readonly freshnessMs: number
  read(signal: AbortSignal): Promise<SnapshotCore>
}
