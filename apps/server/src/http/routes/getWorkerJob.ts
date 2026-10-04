import { identifierSchema } from '@orbit/contract'
import type { Handler } from 'hono'

import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import type { WorkerJobClient } from '../../types/WorkerJobClient'
import { parseWorkerJobDetail } from './parseWorkerJobDetail'
import { workerAdminError } from './workerAdminError'

export const getWorkerJob =
  (read: WorkerJobClient | null, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const id = identifierSchema.safeParse(c.req.param('id'))
    if (!id.success) return c.json({ error: 'bad_request' }, 400)
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const result = await pool
      .run(
        async (signal) =>
          read(
            `/v1/admin/jobs/${encodeURIComponent(id.data)}`,
            'GET',
            null,
            signal,
          ),
        4000,
      )
      .catch(() => null)
    if (result === null) return c.json({ error: 'unavailable' }, 503)
    if (result.status !== 200)
      return workerAdminError(c, result.status, result.body)
    const view = parseWorkerJobDetail(result.body)
    return view === null ? c.json({ error: 'unavailable' }, 503) : c.json(view)
  }
