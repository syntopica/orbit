import type { Handler } from 'hono'

import { toAtriumView } from '../../atriumView/toAtriumView'
import type { AtriumDeps } from '../../types/AtriumDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'

// Fixed JSON on any failure: the reason stays on the atrium card.
export const getAtrium =
  (
    atrium: AtriumDeps | null,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (atrium === null) return c.json({ error: 'unavailable' }, 503)
    const docs = await pool.run(atrium.read, 4000).catch(() => null)
    return docs === null
      ? c.json({ error: 'unavailable' }, 503)
      : c.json(toAtriumView(docs, atrium.refreshIntervalMs, now()))
  }
