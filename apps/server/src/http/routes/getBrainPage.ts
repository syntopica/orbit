import { pageIdSchema } from '@orbit/contract'
import type { Handler } from 'hono'

import { toBrainPage } from '../../brainView/toBrainPage'
import type { BrainReaders } from '../../types/BrainReaders'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'

// An id outside the pattern never reaches the engine (spec 7.5). Content is
// in the 200 response only; every failure is fixed JSON.
export const getBrainPage =
  (
    read: BrainReaders['page'] | null,
    pool: DetailPool,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    const id = pageIdSchema.safeParse(c.req.query('id'))
    if (!id.success) return c.json({ error: 'bad_request' }, 400)
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const doc = await pool
      .run(async (signal) => read(id.data, signal), 10_000)
      .catch(() => null)
    if (doc === null) return c.json({ error: 'unavailable' }, 503)
    if ('error' in doc)
      return doc.error === 'page_not_found'
        ? c.json({ error: 'not_found' }, 404)
        : c.json({ error: 'bad_request' }, 400)
    return c.json(toBrainPage(id.data, doc))
  }
