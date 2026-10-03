import type { Handler } from 'hono'

import { toClipsView } from '../../clipsView/toClipsView'
import type { ClipsReader } from '../../types/ClipsReader'
import type { DetailPool } from '../../types/DetailPool'
import type { Hub } from '../../types/Hub'
import type { OrbitEnv } from '../../types/OrbitEnv'

// Two engine runs of about 1.6 s together; 10 s from enqueue.
export const getClips =
  (
    read: ClipsReader | null,
    hub: Hub,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const docs = await pool.run(read, 10_000).catch(() => null)
    if (docs === null) return c.json({ error: 'unavailable' }, 503)
    const capture = hub.snapshots().find((s) => s.component === 'capture')
    return c.json(toClipsView(docs, capture, now()))
  }
