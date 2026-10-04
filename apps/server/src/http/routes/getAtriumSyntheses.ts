import type { Handler } from 'hono'

import { toSynthesesView } from '../../atriumView/toSynthesesView'
import type { AtriumSynthesisReaders } from '../../types/AtriumSynthesisReaders'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { contextErrorCode } from './contextErrorCode'

// The newest records and tokens per day: identities, models, counts and
// instants only, so the result may be cached (spec 5.4, 6.6).
export const getAtriumSyntheses =
  (
    readers: AtriumSynthesisReaders | null,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (readers === null) return c.json({ error: 'unavailable' }, 503)
    const result = await pool.run(readers.recent, 31_000).then(
      (doc) => ({ doc }),
      (error: unknown) => ({ error: contextErrorCode(error) }),
    )
    return 'error' in result
      ? c.json({ error: result.error }, 503)
      : c.json(toSynthesesView(result.doc, now()))
  }
