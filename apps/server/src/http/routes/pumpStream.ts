import type { StreamMessage } from '@orbit/contract'
import type { SSEStreamingApi } from 'hono/streaming'

import { flushQueue } from './flushQueue'

// Forwards queued hub messages and pings every 15 s until the client leaves.
export const pumpStream = async (
  stream: SSEStreamingApi,
  queue: StreamMessage[],
  opened: number,
): Promise<void> => {
  let sent = opened
  let lastPing = Date.now()
  while (!stream.aborted) {
    sent = await flushQueue(stream, queue, sent)
    if (Date.now() - lastPing >= 15_000) {
      await stream.writeSSE({ event: 'ping', data: '' })
      lastPing = Date.now()
    }
    await stream.sleep(250)
  }
}
