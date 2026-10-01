import type { Snapshot } from '@orbit/contract'

export type Emitter = {
  open(): void
  close(): void
  emit(snapshot: Snapshot): void
  degrade(reason: 'lagging' | 'stale'): void
}
