import type { ComponentId, Snapshot, StreamMessage } from '@orbit/contract'

import type { SentSnapshotEntry } from './SentSnapshotEntry'

export type SnapshotPublisherDeps = {
  current: Map<ComponentId, Snapshot>
  sent: Map<ComponentId, SentSnapshotEntry>
  send: (message: StreamMessage) => void
  nextId: () => number
}
