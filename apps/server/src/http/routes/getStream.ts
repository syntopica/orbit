import type { StreamMessage } from '@orbit/contract'
import type { Handler } from 'hono'
import { getCookie } from 'hono/cookie'
import { streamSSE } from 'hono/streaming'

import type { DatabaseSync } from 'node:sqlite'

import { touchSession } from '../../auth/touchSession'
import type { Hub } from '../../types/Hub'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'
import { parseLastEventId } from './parseLastEventId'
import { pumpStream } from './pumpStream'
import { writeOpening } from './writeOpening'

// A client that stops reading lets its queue reach the ring size; the stream
// is then aborted and the client reconnects into a replay or resync.
export const getStream =
  (
    hub: Hub,
    authDb: DatabaseSync,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  (c) =>
    streamSSE(c, async (stream) => {
      const queue: StreamMessage[] = []
      const unsubscribe = hub.subscribe((message) => {
        if (queue.length >= hub.ringSize) stream.abort()
        else queue.push(message)
      })
      stream.onAbort(unsubscribe)
      try {
        const lastEventId = parseLastEventId(c.req.header('Last-Event-ID'))
        const opened = await writeOpening(stream, hub, lastEventId)
        const id = getCookie(c, SESSION_COOKIE) ?? ''
        await pumpStream(stream, queue, opened, {
          now,
          isLive: () => touchSession(authDb, id, now()),
        })
      } catch {
        // The stream just closes: a raw error is never logged or sent.
      } finally {
        unsubscribe()
      }
    })
