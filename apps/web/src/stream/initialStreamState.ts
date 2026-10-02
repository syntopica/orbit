import type { StreamState } from '../types/StreamState'

export const INITIAL_STREAM_STATE: StreamState = {
  snapshots: {},
  events: [],
  lastId: null,
  synced: false,
}
