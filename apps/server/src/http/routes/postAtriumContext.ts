import type { Handler } from 'hono'

import { toAtriumContext } from '../../atriumView/toAtriumContext'
import type { AtriumContextReader } from '../../types/AtriumContextReader'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { atriumContextBodySchema } from './atriumContextBodySchema'
import { contextErrorCode } from './contextErrorCode'
import { readJsonBody } from './readJsonBody'

// Spec 7.4: one bounded query, 5 s under the memory detail pool. The query
// and the evidence text appear in the 200 response only (spec 6.6).
export const postAtriumContext =
  (
    read: AtriumContextReader | null,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    const body = atriumContextBodySchema.safeParse(await readJsonBody(c))
    if (!body.success) return c.json({ error: 'bad_request' }, 400)
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const { query } = body.data
    const result = await pool
      .run(async (signal) => read(query, signal), 5000)
      .then(
        (doc) => ({ doc }),
        (error: unknown) => ({ error: contextErrorCode(error) }),
      )
    return 'error' in result
      ? c.json({ error: result.error }, 503)
      : c.json(toAtriumContext(result.doc, now()))
  }
