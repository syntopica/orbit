import type { StreamMessage } from '@orbit/contract'
import type { SSEStreamingApi } from 'hono/streaming'

import { writeMessage } from './writeMessage'

// Messages already covered by the opening (id <= sent) are dropped.
export const flushQueue = async (
  stream: SSEStreamingApi,
  queue: StreamMessage[],
  sent: number,
): Promise<number> => {
  let last = sent
  for (const message of queue.splice(0)) {
    if (message.id > last) {
      await writeMessage(stream, message, true)
      last = message.id
    }
  }
  return last
}
