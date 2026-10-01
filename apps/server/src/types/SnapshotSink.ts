import type { Snapshot } from '@orbit/contract'

export type SnapshotSink = { publish(snapshot: Snapshot): void }
