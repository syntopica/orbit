import type { StreamMessage } from '@orbit/contract'
import type { SSEStreamingApi } from 'hono/streaming'

import type { StreamClock } from '../../types/StreamClock'
import { flushQueue } from './flushQueue'

// Forwards queued hub messages and sends a named ping event every 15 s
// (spec 5.5) until the client leaves or the stream is aborted. Each ping also
// re-checks the session, so a revoked or expired one ends the stream.
export const pumpStream = async (
  stream: SSEStreamingApi,
  queue: StreamMessage[],
  opened: number,
  clock: StreamClock,
): Promise<void> => {
  let sent = opened
  let lastPing = clock.now()
  while (!stream.aborted) {
    sent = await flushQueue(stream, queue, sent)
    if (clock.now() - lastPing >= 15_000) {
      if (!clock.isLive()) return
      await stream.write('event: ping\ndata: 1\n\n')
      lastPing = clock.now()
    }
    await stream.sleep(250)
  }
}
