import type { StreamState } from './StreamState'

export type DownTracking = {
  readonly snapshots: StreamState['snapshots']
  readonly synced: boolean
}
