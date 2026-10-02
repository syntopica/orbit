import type { StreamState } from './StreamState'
import type { StreamStatus } from './StreamStatus'

export type StreamValue = StreamState & { readonly status: StreamStatus }
