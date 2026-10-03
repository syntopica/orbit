import type { SSEStreamingApi } from 'hono/streaming'

import type { Hub } from '../../types/Hub'
import { writeMessage } from './writeMessage'

// Only the closing `sync` of a full opening carries an SSE id, so a connection
// that drops halfway reconnects with the previous id and gets the whole set
// again. A replay carries its own ids and ends with an id-less `sync`.
export const writeOpening = async (
  stream: SSEStreamingApi,
  hub: Hub,
  requested: number | null,
): Promise<number> => {
  const replay = requested === null ? null : hub.replayAfter(requested)
  if (requested !== null && replay !== null) {
    for (const message of replay) await writeMessage(stream, message, true)
    const last = replay.at(-1)?.id ?? requested
    await writeMessage(stream, { type: 'sync', id: last }, false)
    return last
  }
  const id = hub.lastId()
  if (requested !== null) {
    await writeMessage(stream, { type: 'resync', id }, false)
  }
  for (const snapshot of hub.snapshots()) {
    await writeMessage(stream, { type: 'snapshot', id, snapshot }, false)
  }
  for (const message of hub.recentEvents()) {
    await writeMessage(stream, message, false)
  }
  await writeMessage(stream, { type: 'sync', id }, true)
  return id
}
