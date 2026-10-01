import type { OrbitEvent, Snapshot, StreamMessage } from '@orbit/contract'

import type { SnapshotSink } from './SnapshotSink'

export type Hub = SnapshotSink & {
  snapshots(): Snapshot[]
  recentEvents(): OrbitEvent[]
  lastId(): number
  replayAfter(id: number): StreamMessage[] | null
  subscribe(listener: (message: StreamMessage) => void): () => void
}
