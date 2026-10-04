import type {
  EventMessage,
  OrbitEvent,
  Snapshot,
  StreamMessage,
} from '@orbit/contract'

import type { SnapshotSink } from './SnapshotSink'

export type Hub = SnapshotSink & {
  readonly ringSize: number
  publishEvent(event: OrbitEvent): void
  snapshots(): Snapshot[]
  recentEvents(): EventMessage[]
  lastId(): number
  replayAfter(id: number): StreamMessage[] | null
  subscribe(listener: (message: StreamMessage) => void): () => void
}
