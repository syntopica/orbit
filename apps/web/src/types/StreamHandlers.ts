import type { StreamMessage } from '@orbit/contract'

import type { StreamStatus } from './StreamStatus'

export type StreamHandlers = {
  readonly onMessage: (message: StreamMessage) => void
  readonly onStatus: (status: StreamStatus) => void
}
