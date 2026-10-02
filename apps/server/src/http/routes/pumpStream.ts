import type { StreamMessage } from '@orbit/contract'
import type { SSEStreamingApi } from 'hono/streaming'

import { flushQueue } from './flushQueue'

// Forwards queued hub messages and sends a named ping event every 15 s
// (spec 5.5) until the client leaves or the stream is aborted.
export const pumpStream = async (
  stream: SSEStreamingApi,
  queue: StreamMessage[],
  opened: number,
  now: () => number,
): Promise<void> => {
  let sent = opened
  let lastPing = now()
  while (!stream.aborted) {
    sent = await flushQueue(stream, queue, sent)
    if (now() - lastPing >= 15_000) {
      await stream.write('event: ping\ndata: 1\n\n')
      lastPing = now()
    }
    await stream.sleep(250)
  }
}
