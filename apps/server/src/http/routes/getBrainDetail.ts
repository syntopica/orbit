import type { Handler } from 'hono'

import type { BrainDetailArgs } from '../../types/BrainDetailArgs'
import type { OrbitEnv } from '../../types/OrbitEnv'

// One brain read under the detail pool; fixed JSON on any failure, so engine
// output never reaches a response (spec 8).
export const getBrainDetail =
  <T>(
    ...[read, toView, pool, now, timeoutMs]: BrainDetailArgs<T>
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const doc = await pool.run(read, timeoutMs).catch(() => null)
    return doc === null
      ? c.json({ error: 'unavailable' }, 503)
      : c.json(toView(doc, now()))
  }
