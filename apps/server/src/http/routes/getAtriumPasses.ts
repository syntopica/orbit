import type { Handler } from 'hono'

import { toPassesView } from '../../atriumView/toPassesView'
import type { AtriumSynthesisReaders } from '../../types/AtriumSynthesisReaders'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { contextErrorCode } from './contextErrorCode'

// Recent passes with exit codes, from atrium's tick log (spec 7.4).
export const getAtriumPasses =
  (
    readers: AtriumSynthesisReaders | null,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (readers === null) return c.json({ error: 'unavailable' }, 503)
    const result = await pool.run(readers.passes, 6000).then(
      (doc) => ({ doc }),
      (error: unknown) => ({ error: contextErrorCode(error) }),
    )
    return 'error' in result
      ? c.json({ error: result.error }, 503)
      : c.json(toPassesView(result.doc, now()))
  }
