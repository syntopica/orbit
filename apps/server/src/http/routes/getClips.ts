import type { Handler } from 'hono'

import { toClipsView } from '../../clipsView/toClipsView'
import type { AppDeps } from '../../types/AppDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { CLIPS_READ_MS } from './clipsReadMs'

// A failed read falls back to the adapter's last good one, marked with when it
// was taken, so the screen keeps a result instead of spinning on a timeout.
export const getClips =
  (deps: AppDeps, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const read = deps.clips
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const docs = await pool.run(read, CLIPS_READ_MS).catch(() => null)
    const capture = deps.hub.snapshots().find((s) => s.component === 'capture')
    if (docs !== null) return c.json(toClipsView(docs, capture, deps.now()))
    const held = deps.clipsLastGood?.() ?? null
    if (held === null) return c.json({ error: 'unavailable' }, 503)
    return c.json({
      ...toClipsView(held.documents, capture, deps.now()),
      lastGoodAt: held.at,
    })
  }
