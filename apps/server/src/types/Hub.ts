import type { EventMessage, Snapshot, StreamMessage } from '@orbit/contract'

import type { SnapshotSink } from './SnapshotSink'

export type Hub = SnapshotSink & {
  readonly ringSize: number
  snapshots(): Snapshot[]
  recentEvents(): EventMessage[]
  lastId(): number
  replayAfter(id: number): StreamMessage[] | null
  subscribe(listener: (message: StreamMessage) => void): () => void
}
